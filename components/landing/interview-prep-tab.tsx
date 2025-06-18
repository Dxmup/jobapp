"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MessageSquare, Copy, CheckCircle, Lightbulb } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface InterviewPrepTabProps {
  onActionUsed: () => void
  isDisabled: boolean
}

export function InterviewPrepTab({ onActionUsed, isDisabled }: InterviewPrepTabProps) {
  const [jobDescription, setJobDescription] = useState("")
  const [role, setRole] = useState("")
  const [experience, setExperience] = useState("")
  const [questions, setQuestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (isDisabled) {
      toast({
        title: "Demo limit reached",
        description: "Sign up to continue using our AI tools!",
        variant: "destructive",
      })
      return
    }

    if (!jobDescription.trim()) {
      setError("Please enter a job description")
      return
    }

    if (jobDescription.length < 50) {
      setError("Job description must be at least 50 characters")
      return
    }

    setIsLoading(true)
    setError("")
    setQuestions([])

    try {
      console.log("🚀 Calling interview questions API...")

      const response = await fetch("/api/landing/generate-interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          role: role.trim(),
          experience: experience || "entry to mid-level",
        }),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Response is not JSON, content-type:", contentType)
        const textResponse = await response.text()
        console.error("❌ Response text:", textResponse.substring(0, 200))
        throw new Error("Server returned invalid response format. Please try again.")
      }

      // Parse JSON
      let data
      try {
        data = await response.json()
        console.log("✅ Parsed JSON response:", data)
      } catch (jsonError) {
        console.error("❌ Failed to parse JSON:", jsonError)
        throw new Error("Server returned invalid JSON. Please try again.")
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (data.success && data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions)
        onActionUsed() // Count this as a demo action
        toast({
          title: "Questions generated!",
          description: "Practice these questions to ace your interview.",
        })
      } else {
        throw new Error(data.error || "Invalid response format")
      }
    } catch (err) {
      console.error("❌ Error generating interview questions:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to generate interview questions"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyQuestion = async (question: string, index: number) => {
    try {
      await navigator.clipboard.writeText(question)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
      toast({
        title: "Copied!",
        description: "Question copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the question manually",
        variant: "destructive",
      })
    }
  }

  const copyAllQuestions = async () => {
    try {
      const allQuestions = questions.map((q, i) => `${i + 1}. ${q}`).join("\n\n")
      await navigator.clipboard.writeText(allQuestions)
      toast({
        title: "All questions copied!",
        description: "All interview questions copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the questions manually",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Interview Question Generator
          </CardTitle>
          <CardDescription>
            Generate tailored interview questions based on the job description. Practice your answers to ace the
            interview!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-description">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here... (minimum 50 characters)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isDisabled}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{jobDescription.length} characters</span>
              <span>Minimum: 50 characters</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role/Position (Optional)</Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer, Marketing Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select value={experience} onValueChange={setExperience} disabled={isDisabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="mid-level">Mid Level (3-5 years)</SelectItem>
                  <SelectItem value="senior-level">Senior Level (6+ years)</SelectItem>
                  <SelectItem value="executive">Executive/Leadership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isLoading || isDisabled || !jobDescription.trim() || jobDescription.length < 50}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Generate Interview Questions
              </>
            )}
          </Button>

          {isDisabled && (
            <div className="p-3 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
              Demo limit reached. Sign up to generate unlimited interview questions!
            </div>
          )}
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Interview Questions</CardTitle>
                <CardDescription>Practice these questions to prepare for your interview</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={copyAllQuestions}>
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                      </div>
                      <p className="font-medium leading-relaxed">{question}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyQuestion(question, index)}
                      className="shrink-0"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Interview Tips</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Practice your answers out loud before the interview</li>
                    <li>• Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
                    <li>• Research the company and prepare thoughtful questions to ask</li>
                    <li>• Have specific examples ready that demonstrate your skills</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
