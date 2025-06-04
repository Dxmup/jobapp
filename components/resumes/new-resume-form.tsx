"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, FileText, Clipboard, Wand2, Info, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

interface NewResumeFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function NewResumeForm({ onSuccess, onCancel }: NewResumeFormProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const [newResumeName, setNewResumeName] = useState("")
  const [newResumeContent, setNewResumeContent] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateResume = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newResumeName || !newResumeContent) {
      setError("Please provide both a name and content for your resume")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // Get the current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        throw new Error("You must be logged in to create a resume")
      }

      // Get the user ID from our users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", session.user.id)
        .single()

      if (userError || !userData) {
        throw new Error("Failed to get user information")
      }

      // Insert the resume
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: userData.id,
          name: newResumeName,
          file_name: "manual-entry.txt",
          content: newResumeContent,
          is_ai_generated: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        throw new Error("Failed to create resume: " + error.message)
      }

      // Reset form
      setNewResumeName("")
      setNewResumeContent("")

      // Set the new resume ID in localStorage for highlighting
      if (data && data[0]) {
        localStorage.setItem("newResumeId", data[0].id)
        localStorage.setItem("newResumeName", data[0].name)
        localStorage.setItem("resumeSuccess", "true")
      }

      // Show success message - second condition
      toast({
        title: "Success!",
        description: "Your resume is saved.",
        duration: 3000, // 3 seconds
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Wait for toast to be visible before navigating
      setTimeout(() => {
        // Navigate to resumes page if we're not already there
        if (!window.location.pathname.includes("/dashboard/resumes")) {
          router.push("/dashboard/resumes")
        } else {
          router.refresh()
        }
      }, 3000) // Match the toast duration
    } catch (error) {
      console.error("Error creating resume:", error)
      setError(error instanceof Error ? error.message : "Failed to create resume")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create resume",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Check file type
    if (
      !file.type.match(/(pdf|text\/plain|application\/vnd.openxmlformats-officedocument.wordprocessingml.document)/) &&
      !file.name.match(/\.(pdf|txt|docx)$/)
    ) {
      setError("Unsupported file type. Please upload a PDF, DOCX, or text file.")
      return
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit")
      return
    }

    setIsProcessingFile(true)
    setError(null)

    try {
      // Auto-fill resume name from filename
      const nameWithoutExtension = file.name.split(".")[0]
      if (!newResumeName) {
        setNewResumeName(nameWithoutExtension)
      }

      // For text files, read directly
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text()
        setNewResumeContent(text)
      }
      // For PDF files, extract text
      else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/extract-document-text", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (data.success && data.text) {
          setNewResumeContent(data.text)
        } else {
          throw new Error(data.error || "Failed to extract text from PDF")
        }
      }
      // For DOCX files
      else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/extract-document-text", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (data.success && data.text) {
          setNewResumeContent(data.text)
        } else {
          throw new Error(data.error || "Failed to extract text from DOCX")
        }
      } else {
        throw new Error("Unsupported file type. Please upload a PDF, DOCX, or text file.")
      }

      toast({
        title: "File processed",
        description: "Your file has been processed successfully.",
      })
    } catch (error) {
      console.error("Error processing file:", error)
      setError(error instanceof Error ? error.message : "Failed to process file")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      })
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      // Check if we can access the clipboard
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText()
        if (text && text.length > 0) {
          setNewResumeContent(text)
          setError(null)
          toast({
            title: "Content pasted",
            description: "Text has been pasted from clipboard.",
          })
        } else {
          toast({
            title: "Empty clipboard",
            description: "No text found in clipboard.",
            variant: "destructive",
          })
        }
      } else {
        setError("Clipboard access not supported. Please paste manually using Ctrl+V or Cmd+V.")
        toast({
          title: "Clipboard access denied",
          description: "Please paste manually using Ctrl+V or Cmd+V.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Clipboard read failed:", error)
      setError("Clipboard access denied. Please paste manually using Ctrl+V or Cmd+V.")
      toast({
        title: "Error",
        description: "Failed to read from clipboard. Please paste manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="build" onClick={() => setShowWizard(true)}>
            Build Resume
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resumeName">Resume Name</Label>
            <Input
              id="resumeName"
              placeholder="e.g., Software Engineer Resume"
              value={newResumeName}
              onChange={(e) => setNewResumeName(e.target.value)}
              required
            />
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Upload Your Resume</AlertTitle>
            <AlertDescription>
              You can upload a PDF, DOCX, or text file and we'll extract the content automatically.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Create a temporary file input element
                const fileInput = document.createElement("input")
                fileInput.type = "file"
                fileInput.accept = ".pdf,.txt,.docx"
                fileInput.style.display = "none"

                // Add event listener for when a file is selected
                fileInput.addEventListener("change", (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    handleFileUpload(file)
                  }
                })

                // Add to DOM and trigger click
                document.body.appendChild(fileInput)
                fileInput.click()

                // Clean up
                setTimeout(() => {
                  document.body.removeChild(fileInput)
                }, 1000)
              }}
              disabled={isProcessingFile}
            >
              {isProcessingFile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume File
                </>
              )}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">PDF, DOCX, or TXT up to 10MB</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumeContent">Extracted Content</Label>
            <Textarea
              id="resumeContent"
              placeholder="Content will appear here after uploading a file..."
              className="min-h-[200px] font-mono text-sm"
              value={newResumeContent}
              onChange={(e) => setNewResumeContent(e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="manualResumeName">Resume Name</Label>
            <Input
              id="manualResumeName"
              placeholder="e.g., Software Engineer Resume"
              value={newResumeName}
              onChange={(e) => setNewResumeName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manualResumeContent">Resume Content</Label>
            <Textarea
              id="manualResumeContent"
              placeholder="Paste or type your resume content here..."
              className="min-h-[300px] font-mono text-sm"
              value={newResumeContent}
              onChange={(e) => setNewResumeContent(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handlePasteFromClipboard}>
              <Clipboard className="mr-2 h-4 w-4" />
              Paste from Clipboard
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="build" className="space-y-4 py-4">
          {showWizard ? (
            <div className="text-center py-4">
              <p className="mb-4">
                Our resume builder will guide you through creating a professional resume step by step.
              </p>
              <Button
                onClick={() => {
                  if (onSuccess) onSuccess()
                  router.push("/dashboard/build-resume")
                }}
                className="w-full"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Launch Resume Builder
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Wand2 className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">Build a Professional Resume</h3>
              <p className="text-muted-foreground mb-6">
                Our guided resume builder will help you create a comprehensive, professional resume step by step.
              </p>
              <Button onClick={() => setShowWizard(true)}>Get Started</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {activeTab !== "build" && (
          <Button onClick={handleCreateResume} disabled={isCreating || !newResumeName || !newResumeContent}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Resume"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
