"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAction } from "@/hooks/use-action"

interface InterviewPrepTabProps {
  onActionUsed: () => void
}

const InterviewPrepTab: React.FC<InterviewPrepTabProps> = ({ onActionUsed }) => {
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const { incrementUsageCount } = useAction()

  const handleGenerateQuestions = async () => {
    if (!jobTitle.trim()) {
      toast({
        title: "Job title required",
        description: "Please enter a job title to generate interview questions.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

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

      toast({
        title: "Questions generated!",
        description: `Generated ${data.questions.length} personalized interview questions.`,
      })
    } catch (error) {
      console.error("Error generating questions:", error)

      // Fallback to job-specific questions based on job title
      const fallbackQuestions = getFallbackQuestions(jobTitle)
      setGeneratedQuestions(fallbackQuestions)

      toast({
        title: "Using backup questions",
        description: error instanceof Error ? error.message : "Using job-specific questions instead.",
        variant: "destructive",
      })
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
    <div className="space-y-4">
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium leading-6 text-gray-900">
          Job Title
        </label>
        <div className="mt-2">
          <Input
            type="text"
            name="jobTitle"
            id="jobTitle"
            placeholder="e.g., Software Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div>
        <label htmlFor="jobDescription" className="block text-sm font-medium leading-6 text-gray-900">
          Job Description (Optional)
        </label>
        <div className="mt-2">
          <Textarea
            id="jobDescription"
            name="jobDescription"
            rows={3}
            placeholder="e.g., We are looking for a highly motivated software engineer..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div>
        <Button onClick={handleGenerateQuestions} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Interview Questions"}
        </Button>
      </div>
      {generatedQuestions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Generated Questions:</h2>
          <ul className="list-disc pl-5">
            {generatedQuestions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default InterviewPrepTab
