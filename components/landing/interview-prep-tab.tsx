"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, BrainCircuit, MessageSquare } from "lucide-react"

interface InterviewPrepTabProps {
  onActionUsed: () => void
}

const InterviewPrepTab: React.FC<InterviewPrepTabProps> = ({ onActionUsed }) => {
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateQuestions = async () => {
    if (!jobTitle.trim()) {
      setError("Please enter a job title to generate interview questions.")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      console.log("Making request to generate interview questions...")

      const response = await fetch("/api/landing/generate-interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim() || undefined,
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Parsed response data:", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to generate interview questions")
      }

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions received from AI")
      }

      setGeneratedQuestions(data.questions)
      onActionUsed() // Increment the usage counter
    } catch (error) {
      console.error("Error generating questions:", error)

      // Fallback to job-specific questions based on job title
      const fallbackQuestions = getFallbackQuestions(jobTitle)
      setGeneratedQuestions(fallbackQuestions)

      setError(error instanceof Error ? error.message : "Failed to generate questions. Using backup questions instead.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Add this helper function for fallback questions
  const getFallbackQuestions = (jobTitle: string): string[] => {
    const title = jobTitle.toLowerCase()

    if (title.includes("software") || title.includes("developer") || title.includes("engineer")) {
      return [
        "Tell me about a challenging technical problem you solved recently.",
        "How do you approach debugging complex issues?",
        "Describe your experience with version control and collaboration.",
        "What's your process for learning new technologies?",
        "How do you ensure code quality in your projects?",
      ]
    } else if (title.includes("marketing") || title.includes("sales")) {
      return [
        "How do you measure the success of a marketing campaign?",
        "Describe a time when you had to pivot your strategy.",
        "How do you stay current with industry trends?",
        "Tell me about a successful project you led.",
        "How do you handle competing priorities and deadlines?",
      ]
    } else if (title.includes("manager") || title.includes("lead")) {
      return [
        "How do you motivate team members who are struggling?",
        "Describe your approach to giving constructive feedback.",
        "Tell me about a time you had to make a difficult decision.",
        "How do you handle conflicts within your team?",
        "What's your strategy for setting and achieving team goals?",
      ]
    } else {
      return [
        "Tell me about yourself and your career journey.",
        "What interests you most about this role?",
        "Describe a challenge you overcame in your previous position.",
        "How do you handle stress and tight deadlines?",
        "Where do you see yourself in five years?",
      ]
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <BrainCircuit className="w-5 h-5" />
            Generate Custom Questions
          </CardTitle>
          <CardDescription>
            Get personalized interview questions based on the specific job you're applying for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="jobTitle" className="block text-sm font-medium leading-6 text-gray-900">
              Job Title
            </label>
            <Input
              type="text"
              name="jobTitle"
              id="jobTitle"
              placeholder="e.g., Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="border-purple-200 focus:border-purple-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="jobDescription" className="block text-sm font-medium leading-6 text-gray-900">
              Job Description (Optional)
            </label>
            <Textarea
              id="jobDescription"
              name="jobDescription"
              rows={3}
              placeholder="Paste the job description here for more targeted questions..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="border-purple-200 focus:border-purple-400 min-h-[100px]"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGenerateQuestions}
            disabled={!jobTitle.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Interview Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedQuestions.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <MessageSquare className="w-5 h-5" />
                Interview Questions
              </CardTitle>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {generatedQuestions.length} Questions
              </Badge>
            </div>
            <CardDescription>
              Practice these questions to prepare for your interview. Take time to think through your responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedQuestions.map((question, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg border border-purple-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{question}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">💡 Practice Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Practice answering out loud, not just in your head</li>
                <li>• Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
                <li>• Prepare specific examples from your experience</li>
                <li>• Practice with a friend or record yourself</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default InterviewPrepTab
