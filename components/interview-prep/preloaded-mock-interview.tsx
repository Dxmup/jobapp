"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Phone,
  PhoneCall,
  Rocket,
  User,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { LiveInterview } from "./live-interview"
import { generateInterviewQuestions } from "@/app/actions/interview-prep-actions"

interface PreloadedMockInterviewProps {
  job: any
  resume?: string
  questions: {
    technical: string[]
    behavioral: string[]
  }
  questionsError?: string | null
  isPreloaded?: boolean
  userFirstName?: string
  userName?: string
}

export function PreloadedMockInterview({
  job,
  resume,
  questions: initialQuestions,
  questionsError: initialQuestionsError,
  isPreloaded = false,
  userFirstName = "the candidate",
  userName = "the candidate",
}: PreloadedMockInterviewProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [questionsError, setQuestionsError] = useState(initialQuestionsError)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [showInterview, setShowInterview] = useState(false)

  console.log(`🎭 PreloadedMockInterview received props:`, {
    jobTitle: job?.title,
    userFirstName,
    userName,
    isPreloaded,
    questionsCount: questions.technical.length + questions.behavioral.length,
  })

  // Update questions when props change
  useEffect(() => {
    setQuestions(initialQuestions)
    setQuestionsError(initialQuestionsError)
  }, [initialQuestions, initialQuestionsError])

  const totalQuestions = questions.technical.length + questions.behavioral.length
  const hasEnoughQuestions = totalQuestions >= 3

  // Auto-start interview if preloaded and has enough questions
  useEffect(() => {
    if (isPreloaded && hasEnoughQuestions && !questionsError) {
      console.log(`🚀 Auto-starting preloaded interview with ${totalQuestions} questions`)
      setShowInterview(true)
    }
  }, [isPreloaded, hasEnoughQuestions, questionsError, totalQuestions])

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true)
    setQuestionsError(null)

    try {
      console.log("🔄 Generating questions for job:", job.id, "resume:", resume)

      const result = await generateInterviewQuestions(job.id, resume)

      if (result.success && result.questions) {
        console.log("✅ Questions generated successfully:", result.questions)
        setQuestions(result.questions)
      } else {
        console.error("❌ Failed to generate questions:", result.error)
        setQuestionsError(result.error || "Failed to generate questions")
      }
    } catch (err: any) {
      console.error("❌ Error generating questions:", err)
      setQuestionsError(err.message || "Failed to generate questions")
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const handleStartInterview = () => {
    console.log(`🎙️ Starting interview with user: "${userFirstName}"`)
    setShowInterview(true)
  }

  const handleBackToPrep = () => {
    setShowInterview(false)
  }

  // If showing interview, render the LiveInterview component
  if (showInterview && hasEnoughQuestions) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToPrep} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Prep
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>
              {job.title} at {job.company}
            </span>
            {userFirstName !== "the candidate" && (
              <>
                <span>•</span>
                <User className="h-4 w-4" />
                <span>Interviewing {userFirstName}</span>
              </>
            )}
          </div>
        </div>

        {/* Live Interview Component */}
        <LiveInterview
          job={job}
          resume={resume}
          questions={questions}
          interviewType="phone-screener"
          isPreloaded={isPreloaded}
          userFirstName={userFirstName}
        />
      </div>
    )
  }

  // Otherwise, show the preparation screen
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/interview-prep/${job.id}${resume ? `?resumeId=${resume}` : ""}`}>
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Prep
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>
            {job.title} at {job.company}
          </span>
          {userFirstName !== "the candidate" && (
            <>
              <span>•</span>
              <User className="h-4 w-4" />
              <span>Candidate: {userFirstName}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mock Phone Interview</span>
            <div className="flex gap-2">
              {isPreloaded && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-50 text-green-700 border-green-300"
                >
                  <Rocket className="h-3 w-3" />
                  Preloaded
                </Badge>
              )}
              <Badge variant="outline">Phone Screening</Badge>
              <Badge variant="outline">15 min max</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Questions Status */}
          {isGeneratingQuestions && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Generating Interview Questions</AlertTitle>
              <AlertDescription>
                Creating personalized interview questions based on the job description and your resume...
              </AlertDescription>
            </Alert>
          )}

          {questionsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Questions</AlertTitle>
              <AlertDescription>{questionsError}</AlertDescription>
            </Alert>
          )}

          {!hasEnoughQuestions && !isGeneratingQuestions && !questionsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Enough Questions</AlertTitle>
              <AlertDescription>
                {totalQuestions > 0
                  ? `Only ${totalQuestions} questions available. Need at least 3 for a realistic interview.`
                  : "No interview questions found."}
                <div className="mt-3">
                  <Button onClick={handleGenerateQuestions} disabled={isGeneratingQuestions} size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Questions
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Interview Ready */}
          {hasEnoughQuestions && !questionsError && (
            <div className={`p-6 rounded-lg ${isPreloaded ? "bg-green-50" : "bg-blue-50"}`}>
              <div className="flex items-center gap-3 mb-4">
                {isPreloaded ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Phone className="h-6 w-6 text-blue-600" />
                )}
                <h3 className={`text-xl font-bold ${isPreloaded ? "text-green-900" : "text-blue-900"}`}>
                  {isPreloaded ? "Ready for Instant Interview!" : "Interview Ready"}
                </h3>
              </div>

              <div className={`space-y-2 text-sm ${isPreloaded ? "text-green-800" : "text-blue-800"}`}>
                <p>
                  <strong>Position:</strong> {job.title} at {job.company}
                </p>
                <p>
                  <strong>Candidate:</strong> {userFirstName}
                </p>
                <p>
                  <strong>Questions:</strong> {questions.technical.length} technical, {questions.behavioral.length}{" "}
                  behavioral
                </p>
                <p>
                  <strong>Format:</strong> Phone screening focused on basic qualifications
                </p>
                <p>
                  <strong>Duration:</strong> 15 minutes maximum
                </p>
                {isPreloaded && (
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="text-green-700 font-medium">Questions pre-loaded for instant start!</span>
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Interview Preparation</span>
                  <span>{isPreloaded ? "100%" : "Ready"}</span>
                </div>
                <Progress value={isPreloaded ? 100 : 85} className="h-2" />
              </div>

              {/* Start Button */}
              <div className="mt-6">
                <Button
                  onClick={handleStartInterview}
                  size="lg"
                  className={`w-full ${
                    isPreloaded ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isPreloaded ? (
                    <>
                      <Rocket className="mr-2 h-5 w-5" />
                      Start Instant Interview
                    </>
                  ) : (
                    <>
                      <PhoneCall className="mr-2 h-5 w-5" />
                      Start Mock Interview
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 text-lg">How Mock Phone Interview Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-700">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <p>AI interviewer introduces themselves and explains the process</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <p>Questions are asked concisely, focusing on basic qualifications</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <p>Your microphone activates after each question for your response</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                    4
                  </div>
                  <p>Silence detection automatically moves to the next question</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                    5
                  </div>
                  <p>Interview concludes with professional closing and next steps</p>
                </div>
                {userFirstName !== "the candidate" && (
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="font-medium">
                      The AI interviewer will address you as "{userFirstName}" throughout the interview for a realistic
                      experience.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
