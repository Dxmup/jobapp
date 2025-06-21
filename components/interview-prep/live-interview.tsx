"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, Zap } from "lucide-react"
import { generateInterviewQuestions } from "@/app/actions/interview-prep-actions"

interface LiveInterviewProps {
  questions: {
    technical: string[]
    behavioral: string[]
  }
  interviewType: string
  job: any // Replace with actual Job type
  resume: any // Replace with actual Resume type
  setQuestions: (questions: any) => void
  setError: (error: string) => void
}

const LiveInterview: React.FC<LiveInterviewProps> = ({
  questions,
  interviewType,
  job,
  resume,
  setQuestions,
  setError,
}) => {
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)

  useEffect(() => {
    console.log("🔍 LiveInterview received questions:", {
      technical: questions.technical.length,
      behavioral: questions.behavioral.length,
      total: questions.technical.length + questions.behavioral.length,
      interviewType,
    })
  }, [questions, interviewType])

  const hasEnoughQuestions = questions.technical.length + questions.behavioral.length >= 3

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true)
    try {
      console.log("🔄 Generating questions for job:", job.id, "resume:", resume?.id)

      const result = await generateInterviewQuestions(job.id, resume?.id)

      if (result.success && result.questions) {
        console.log("✅ Questions generated successfully:", result.questions)
        setQuestions(result.questions)
      } else {
        console.error("❌ Failed to generate questions:", result.error)
        setError(result.error || "Failed to generate questions")
      }
    } catch (err: any) {
      console.error("❌ Error generating questions:", err)
      setError(err.message || "Failed to generate questions")
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  if (!hasEnoughQuestions) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Not enough questions</h3>
          <p className="text-gray-600 mt-1">
            {questions.technical.length + questions.behavioral.length > 0
              ? `Only ${questions.technical.length + questions.behavioral.length} questions available. Need at least 3.`
              : "No interview questions found. Let's generate some for you."}
          </p>
        </div>
        <Button
          onClick={handleGenerateQuestions}
          disabled={isGeneratingQuestions}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGeneratingQuestions ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating Questions...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Generate Interview Questions
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Display interview questions here */}
      <p>Interview Type: {interviewType}</p>
      <h3>Technical Questions</h3>
      <ul>
        {questions.technical.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ul>
      <h3>Behavioral Questions</h3>
      <ul>
        {questions.behavioral.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ul>
    </div>
  )
}

export default LiveInterview
