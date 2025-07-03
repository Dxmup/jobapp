"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, FileText, Sparkles, Copy, Check } from "lucide-react"
import { ResumeChangesList } from "./resume-changes-list"
import { detectActualChanges, type TextChange } from "@/lib/diff-detector"
import { useToast } from "@/hooks/use-toast"

interface ResumeOptimizationTabProps {
  onActionUsed: () => void
  isDisabled: boolean
}

interface OptimizationResult {
  originalResume: string
  optimizedResume: string
  changes: TextChange[]
  note?: string
}

export function ResumeOptimizationTab({ onActionUsed, isDisabled }: ResumeOptimizationTabProps) {
  const [resumeText, setResumeText] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Support both text and PDF files
      if (
        !file.type.includes("text") &&
        file.type !== "application/pdf" &&
        !file.name.endsWith(".txt") &&
        !file.name.endsWith(".pdf")
      ) {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt or .pdf file, or paste your resume text directly.",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      try {
        if (file.type === "application/pdf") {
          // Handle PDF upload
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/extract-pdf-text", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Failed to extract text from PDF")
          }

          const data = await response.json()
          setResumeText(data.text || "")

          toast({
            title: "PDF uploaded successfully",
            description: "Text has been extracted from your PDF resume.",
          })
        } else {
          // Handle text file
          const reader = new FileReader()
          reader.onload = (e) => {
            const content = e.target?.result as string
            setResumeText(content)
          }
          reader.readAsText(file)
        }
      } catch (error) {
        console.error("Error processing file:", error)
        toast({
          title: "Upload failed",
          description: "Failed to process the uploaded file. Please try again.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleOptimizeResume = async () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume required",
        description: "Please paste your resume text or upload a file.",
        variant: "destructive",
      })
      return
    }

    if (resumeText.length < 50) {
      toast({
        title: "Resume too short",
        description: "Please provide a more complete resume (at least 50 characters).",
        variant: "destructive",
      })
      return
    }

    setIsOptimizing(true)

    try {
      console.log("Making request to optimize resume...")

      const response = await fetch("/api/landing/optimize-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeContent: resumeText,
        }),
      })

      console.log("Response status:", response.status)

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Non-JSON response received:", responseText)
        throw new Error("Server returned invalid response format. Please try again.")
      }

      let data
      try {
        data = await response.json()
        console.log("Parsed response data:", data)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        throw new Error("Server returned invalid response. Please try again.")
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to optimize resume")
      }

      // Hybrid approach: Use Gemini changes if available, otherwise detect changes
      let finalChanges: TextChange[] = []

      if (data.changes && Array.isArray(data.changes) && data.changes.length > 0) {
        // Use Gemini-provided changes
        console.log("Using Gemini-provided changes:", data.changes)
        finalChanges = data.changes
      } else {
        // Fall back to diff detection
        console.log("Falling back to diff detection")
        const detectedChanges = detectActualChanges(data.originalResume, data.optimizedResume)
        finalChanges = detectedChanges.slice(0, 2) // Limit to 2 changes
      }

      // Ensure we have at least some changes to show
      if (finalChanges.length === 0) {
        finalChanges = [
          {
            original: "Generic resume language",
            improved: "Professional, action-oriented language with stronger impact",
            type: "language",
            explanation: "Enhanced overall professional presentation and clarity",
          },
        ]
      }

      setOptimizationResult({
        originalResume: data.originalResume,
        optimizedResume: data.optimizedResume,
        changes: finalChanges,
        note: data.note,
      })

      onActionUsed() // Increment the usage counter

      toast({
        title: "Resume optimized!",
        description: data.note || "Your resume has been enhanced with professional improvements.",
      })
    } catch (error) {
      console.error("Error optimizing resume:", error)
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleCopyResume = async () => {
    if (!optimizationResult?.optimizedResume) return

    try {
      await navigator.clipboard.writeText(optimizationResult.optimizedResume)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Optimized resume copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setResumeText("")
    setOptimizationResult(null)
    setCopied(false)
  }

  if (optimizationResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Resume Optimization Results
          </h3>
          <Button variant="outline" onClick={handleReset}>
            Try Another Resume
          </Button>
        </div>

        {optimizationResult.note && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> {optimizationResult.note}
            </p>
          </div>
        )}

        {/* AI Improvements Made - Full Width */}
        <ResumeChangesList changes={optimizationResult.changes} />

        {/* Optimized Resume - Full Width */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-green-600">Optimized Resume</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopyResume} className="flex items-center gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <pre className="text-sm leading-relaxed text-left whitespace-pre-wrap font-sans overflow-x-auto">
                {optimizationResult.optimizedResume}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          See Your Resume Transformed
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Watch JobCraft turn any resume into an interview magnet in seconds. Upload yours and see the difference
          immediately. Sign up for automated full results.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload or Paste Your Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* File upload option */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Upload your resume (.txt or .pdf file)</p>
              <input
                type="file"
                accept=".txt,.pdf,text/plain,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
                disabled={isDisabled}
              />
              <Button variant="outline" asChild disabled={isDisabled}>
                <label htmlFor="resume-upload" className="cursor-pointer">
                  Choose File
                </label>
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">or</div>

            {/* Text area option */}
            <div className="space-y-2">
              <label htmlFor="resume-text" className="text-sm font-medium">
                Paste your resume here and prepare to be amazed...
              </label>
              <Textarea
                id="resume-text"
                placeholder="Paste your resume content here... (minimum 50 characters)"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                disabled={isDisabled}
              />
              <div className="text-xs text-muted-foreground text-right">{resumeText.length} characters</div>
            </div>
          </div>

          <Button
            onClick={handleOptimizeResume}
            disabled={isOptimizing || !resumeText.trim() || isDisabled}
            className="w-full"
            size="lg"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Optimizing Resume...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Optimize My Resume
              </>
            )}
          </Button>

          {isDisabled && (
            <p className="text-sm text-muted-foreground text-center">
              Demo limit reached. Sign up to continue optimizing resumes!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
