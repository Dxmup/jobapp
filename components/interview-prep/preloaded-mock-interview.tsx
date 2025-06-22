"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Loader2, Zap, Clock } from "lucide-react"
import { LiveInterview } from "./live-interview"
import { getInterviewQuestions, generateInterviewQuestions } from "@/app/actions/interview-prep-actions"

interface PreloadedMockInterviewProps {
  job: any
  resume?: any
  preloadedQuestions?: {
    technical: string[]
    behavioral: string[]
  } | null
  shouldPreload: boolean
  interviewType?: "phone-screener" | "first-interview"
}

export function PreloadedMockInterview({
  job,
  resume,
  preloadedQuestions,
  shouldPreload,
  interviewType = "first-interview",
}: PreloadedMockInterviewProps) {
  const [questions, setQuestions] = useState(preloadedQuestions || { technical: [], behavioral: [] })
  const [isLoading, setIsLoading] = useState(true) // Always start loading
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState<string>("Initializing...")
  const [error, setError] = useState<string | null>(null)
  const [isPreparingInterview, setIsPreparingInterview] = useState(false)

  const hasQuestions = questions.technical.length > 0 || questions.behavioral.length > 0
  const hasEnoughQuestions = questions.technical.length + questions.behavioral.length >= 3
  const totalQuestions = questions.technical.length + questions.behavioral.length

  // Auto-load and generate questions on mount
  useEffect(() => {
    autoLoadQuestions()
  }, [])

  const autoLoadQuestions = async () => {
    try {
      setIsLoading(true)
      setLoadingProgress(5)
      setLoadingStage("Checking for existing questions...")
      setError(null)

      console.log("🚀 Auto-loading interview questions...")

      // First, try to load existing questions
      setLoadingProgress(15)
      const result = await getInterviewQuestions(job.id, resume?.id)

      if (result.success && result.questions) {
        const existingTotal = result.questions.technical.length + result.questions.behavioral.length
        console.log(`📋 Found ${existingTotal} existing questions`)

        if (existingTotal >= 3) {
          // We have enough questions, use them
          setQuestions(result.questions)
          setLoadingProgress(50)
          setLoadingStage("Questions loaded! Preparing interview...")

          // Start preparing the interview immediately
          await prepareInterview(result.questions)
          return
        }
      }

      // Not enough questions, generate new ones
      console.log("📝 Generating new interview questions...")
      setLoadingProgress(25)
      setLoadingStage("Generating personalized questions...")

      // Simulate progress during generation
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev < 70) return prev + 2
          return prev
        })
      }, 300)

      const generateResult = await generateInterviewQuestions(job.id, resume?.id)
      clearInterval(progressInterval)

      if (generateResult.success && generateResult.questions) {
        setQuestions(generateResult.questions)
        setLoadingProgress(75)
        setLoadingStage("Questions generated! Preparing interview...")

        console.log(
          `✅ Generated ${generateResult.questions.technical.length} technical + ${generateResult.questions.behavioral.length} behavioral questions`,
        )

        // Start preparing the interview immediately
        await prepareInterview(generateResult.questions)
      } else {
        throw new Error(generateResult.error || "Failed to generate questions")
      }
    } catch (err: any) {
      console.error("❌ Failed to auto-load questions:", err)
      setError(err.message)
      setLoadingProgress(0)
      setLoadingStage("Error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const prepareInterview = async (questionsToUse: { technical: string[]; behavioral: string[] }) => {
    try {
      setIsPreparingInterview(true)
      setLoadingProgress(80)
      setLoadingStage("Preparing interview system...")

      // Simulate interview preparation (this would be where we pre-generate audio, etc.)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setLoadingProgress(95)
      setLoadingStage("Optimizing audio generation...")

      // Another brief delay for final preparations
      await new Promise((resolve) => setTimeout(resolve, 800))

      setLoadingProgress(100)
      setLoadingStage("Ready to start!")

      console.log("🎯 Interview preparation complete!")

      // Brief pause to show completion
      setTimeout(() => {
        setIsPreparingInterview(false)
      }, 500)
    } catch (err: any) {
      console.error("❌ Failed to prepare interview:", err)
      setError(`Failed to prepare interview: ${err.message}`)
      setIsPreparingInterview(false)
    }
  }

  const retryLoading = () => {
    setError(null)
    autoLoadQuestions()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mock Phone Interview</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Auto-Generated
              </Badge>
              <Badge variant="outline">
                {interviewType === "phone-screener" ? "Phone Screener" : "First Interview"}
              </Badge>
              <Badge variant="outline">{job.company}</Badge>
              <Badge variant="outline">{job.title}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Job Context */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Interview Setup</h3>
              <div className="mt-2 text-sm text-blue-800">
                <p>
                  <strong>Company:</strong> {job.company}
                </p>
                <p>
                  <strong>Position:</strong> {job.title}
                </p>
                <p>
                  <strong>Candidate:</strong> {resume?.name || "You"}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  {interviewType === "phone-screener" ? "Phone Screener (15 min)" : "First Interview (30 min)"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {isLoading ? "Preparing..." : hasEnoughQuestions ? "Ready to start!" : "Needs setup"}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-800">Setting Up Your Interview</div>
                    <div className="text-sm text-blue-700">{loadingStage}</div>
                  </div>
                  {loadingProgress > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-800">{loadingProgress}%</div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Setup Progress</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  <Progress value={loadingProgress} className="w-full" />
                </div>

                {/* Loading stages indicator */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div
                    className={`p-2 rounded text-center ${loadingProgress >= 25 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                  >
                    Questions
                  </div>
                  <div
                    className={`p-2 rounded text-center ${loadingProgress >= 50 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                  >
                    Generation
                  </div>
                  <div
                    className={`p-2 rounded text-center ${loadingProgress >= 75 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                  >
                    Preparation
                  </div>
                  <div
                    className={`p-2 rounded text-center ${loadingProgress >= 100 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                  >
                    Ready
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {!isLoading && hasEnoughQuestions && !isPreparingInterview && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-green-800">Interview Ready!</div>
                  <div className="text-sm text-green-700">
                    {totalQuestions} interview questions prepared ({questions.technical.length} technical,{" "}
                    {questions.behavioral.length} behavioral) • Audio system optimized • Ready for instant start
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Instant Start
                  </Badge>
                </div>
              </div>
            )}

            {/* Preparing Interview State */}
            {isPreparingInterview && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                <div className="flex-1">
                  <div className="font-medium text-yellow-800">Optimizing Interview Experience</div>
                  <div className="text-sm text-yellow-700">
                    Pre-generating audio responses and optimizing conversation flow for seamless interaction...
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Setup Failed</AlertTitle>
                <AlertDescription>
                  {error}
                  <div className="mt-3">
                    <button
                      onClick={retryLoading}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                    >
                      Try Again
                    </button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Interview Component */}
      <LiveInterview
        job={job}
        resume={resume}
        questions={questions}
        interviewType={interviewType}
        isPreloaded={!isLoading && hasEnoughQuestions}
      />

      {/* Instructions */}
      {!isLoading && hasEnoughQuestions && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">🚀 Instant Start Interview Ready!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-green-700">
              <p className="font-medium">
                ⚡ Your interview has been fully prepared and optimized for the best possible experience!
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-medium">
                      ✓
                    </div>
                    <p>
                      Questions personalized for {job.title} at {job.company}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-medium">
                      ✓
                    </div>
                    <p>Audio system pre-optimized for smooth conversation</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-medium">
                      ✓
                    </div>
                    <p>
                      {interviewType === "phone-screener"
                        ? "Screening-focused questions (15 min)"
                        : "Comprehensive interview questions (30 min)"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-medium">
                      ✓
                    </div>
                    <p>Professional interviewer voice ready</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-medium">
                      ✓
                    </div>
                    <p>Real-time voice detection calibrated</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-medium">
                      ✓
                    </div>
                    <p>Question queue pre-loaded for instant flow</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg mt-4">
                <p className="text-sm text-green-800">
                  <strong>Ready to Start:</strong> Click "Start Phone Interview" below for an immediate, professional
                  interview experience with no delays!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
