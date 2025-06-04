"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { generateInterviewQuestions, saveInterviewQuestions } from "@/app/actions/interview-prep-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Questions = {
  technical: string[]
  behavioral: string[]
}

interface JobInterviewQuestionsProps {
  jobId: string
  initialQuestions: Questions
  resumeId?: string
}

export function JobInterviewQuestions({ jobId, initialQuestions, resumeId }: JobInterviewQuestionsProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const [saveError, setSaveError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleRefresh = async () => {
    setIsGenerating(true)
    setError(null)
    setSaveError(null)

    try {
      // Pass the current questions to the API to avoid repetition
      const result = await generateInterviewQuestions(jobId, resumeId, questions)

      if (result.success && result.questions) {
        setQuestions(result.questions)
        setRefreshCount((prev) => prev + 1)

        // Save questions to storage
        const saveResult = await saveInterviewQuestions(jobId, result.questions, resumeId)

        if (!saveResult.success) {
          setSaveError(saveResult.error || "Failed to save questions")
        }

        // Refresh the page to update server components
        router.refresh()

        toast({
          title: "Questions refreshed",
          description:
            refreshCount > 0
              ? "New, more probing questions have been generated."
              : "New interview questions have been generated.",
          duration: 3000,
        })
      } else {
        setError(result.error || "Failed to generate questions")
        toast({
          title: "Error",
          description: result.error || "Failed to generate questions",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const hasQuestions = questions.technical.length > 0 || questions.behavioral.length > 0

  // Function to clean question text by removing leading numbers (e.g., "1. Question" becomes "Question")
  const cleanQuestionText = (question: string): string => {
    return question.replace(/^\d+\.\s+/, "")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Interview Questions</CardTitle>
            <CardDescription>
              {hasQuestions
                ? "Practice these questions to prepare for your interview"
                : "Generate questions based on the job description and your resume"}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {hasQuestions ? (refreshCount > 0 ? "Get More Questions" : "Refresh Questions") : "Generate Questions"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {saveError && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
            <p className="font-medium">Error: {error}</p>
            <p className="mt-2">Please try refreshing the questions or come back later.</p>
          </div>
        ) : questions.technical.length === 0 && questions.behavioral.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No questions generated yet. Click the "Generate Questions" button to create interview questions based on
              the job description and your resume.
            </p>
            <Button onClick={handleRefresh} disabled={true}>
              Generate Questions
            </Button>
          </div>
        ) : (
          <div>
            {/* Render technical questions */}
            {questions.technical.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Technical Questions</h3>
                <ul className="list-disc list-inside">
                  {questions.technical.map((question, index) => (
                    <li key={index} className="mb-2">
                      {cleanQuestionText(question)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Render behavioral questions */}
            {questions.behavioral.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Behavioral Questions</h3>
                <ul className="list-disc list-inside">
                  {questions.behavioral.map((question, index) => (
                    <li key={index} className="mb-2">
                      {cleanQuestionText(question)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
