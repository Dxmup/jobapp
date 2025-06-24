"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { LiveInterview } from "./live-interview"
import { generateInterviewQuestions } from "@/app/actions/interview-prep-actions"
import { ArrowLeft, Phone, Rocket, Zap, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface PreloadedMockInterviewProps {
  job: any
  resume?: any
  questions: {
    technical: string[]
    behavioral: string[]
  }
  isPreloaded?: boolean
  userFirstName: string // SIMPLIFIED: Only accept userFirstName
}

export function PreloadedMockInterview({
  job,
  resume,
  questions: initialQuestions,
  isPreloaded = false,
  userFirstName, // SIMPLIFIED: Only use userFirstName
}: PreloadedMockInterviewProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if we have enough questions
  const hasEnoughQuestions = questions.technical.length + questions.behavioral.length >= 3

  // Auto-generate questions if not enough and not already generating
  useEffect(() => {
    if (!hasEnoughQuestions && !isGeneratingQuestions && !error) {
      handleGenerateQuestions()
    }
  }, [hasEnoughQuestions, isGeneratingQuestions, error])

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true)
    setError(null)

    try {
      console.log("🔄 Generating questions for mock interview...")

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/interview-prep/${job.id}${resume ? `?resumeId=${resume.id}` : ""}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Interview Prep
                </Button>
              </Link>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Mock Phone Interview
                  {isPreloaded && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      <Rocket className="h-3 w-3 mr-1" />
                      Pre-loaded
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {job.title} at {job.company}
                  {resume && ` • Using resume: ${resume.name || resume.file_name}`}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Display */}
            {isGeneratingQuestions && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Preparing Your Mock Interview</AlertTitle>
                <AlertDescription>
                  Generating personalized interview questions based on the job description and your resume. This will
                  take just a moment...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Preparing Interview</AlertTitle>
                <AlertDescription>
                  {error}
                  <div className="mt-3">
                    <Button onClick={handleGenerateQuestions} disabled={isGeneratingQuestions} size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {hasEnoughQuestions && !isGeneratingQuestions && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="h-4 w-4 text-green-600" />
                  <h3 className="font-medium text-green-800">Mock Interview Ready!</h3>
                </div>
                <p className="text-sm text-green-700">
                  Your personalized mock interview is ready with {questions.technical.length} technical and{" "}
                  {questions.behavioral.length} behavioral questions. The AI interviewer will conduct a realistic phone
                  interview simulation.
                </p>
                <div className="mt-3 text-xs text-green-600">
                  <p>
                    <strong>Candidate:</strong> {userFirstName} {/* SIMPLIFIED: Only show userFirstName */}
                  </p>
                  <p>
                    <strong>Position:</strong> {job.title}
                  </p>
                  <p>
                    <strong>Company:</strong> {job.company}
                  </p>
                  {resume && (
                    <p>
                      <strong>Resume:</strong> {resume.name || resume.file_name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Interview Component */}
      {hasEnoughQuestions && !isGeneratingQuestions && (
        <LiveInterview
          job={job}
          resume={resume}
          questions={questions}
          interviewType="first-interview"
          isPreloaded={isPreloaded}
          userFirstName={userFirstName} // SIMPLIFIED: Only pass userFirstName
        />
      )}

      {/* Loading State */}
      {isGeneratingQuestions && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <div>
                <h3 className="font-medium">Preparing Your Mock Interview</h3>
                <p className="text-sm text-muted-foreground">
                  Generating personalized questions based on the job and your background...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
