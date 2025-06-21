"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Loader2, Zap } from "lucide-react"
import { LiveInterview } from "./live-interview"
import { getInterviewQuestions } from "@/app/actions/interview-prep-actions"
import type { ConversationalInterviewConfig } from "@/lib/conversational-interview-client"

interface PreloadedMockInterviewProps {
  job: any
  resume?: any
  preloadedQuestions?: {
    technical: string[]
    behavioral: string[]
  } | null
  shouldPreload: boolean
  interviewType: "phone-screener" | "first-interview"
}

export function PreloadedMockInterview({
  job,
  resume,
  preloadedQuestions,
  shouldPreload,
  interviewType,
}: PreloadedMockInterviewProps) {
  const [questions, setQuestions] = useState(preloadedQuestions || { technical: [], behavioral: [] })
  const [isLoading, setIsLoading] = useState(!preloadedQuestions && shouldPreload)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const interviewConfig: ConversationalInterviewConfig = useMemo(
    () => ({
      voice: "Kore",
      maxDuration: interviewType === "phone-screener" ? 15 * 60 * 1000 : 30 * 60 * 1000, // 15 or 30 minutes
      timeWarningAt: interviewType === "phone-screener" ? 12 * 60 * 1000 : 25 * 60 * 1000, // Warning at 12 or 25 minutes
      silenceThreshold: 30, // Audio level threshold for silence detection
      silenceDuration: 750, // 0.75 seconds of silence
      queueSize: 3, // Keep 3 questions in queue
      interviewType: interviewType, // Pass interviewType to the client config
    }),
    [interviewType], // Re-memoize if interviewType changes
  )

  const loadQuestions = async () => {
    try {
      setIsLoading(true)
      setLoadingProgress(10)
      setError(null)

      console.log("🔄 Loading interview questions...")

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await getInterviewQuestions(job.id, resume?.id)

      clearInterval(progressInterval)

      if (result.success && result.questions) {
        setQuestions(result.questions)
        setLoadingProgress(100)
        console.log(
          `✅ Loaded ${result.questions.technical.length} technical + ${result.questions.behavioral.length} behavioral questions`,
        )
      } else {
        throw new Error(result.error || "Failed to load questions")
      }
    } catch (err: any) {
      console.error("❌ Failed to load questions:", err)
      setError(err.message)
      setLoadingProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // If we don't have preloaded questions but should preload, fetch them
    if (!preloadedQuestions && shouldPreload) {
      loadQuestions()
    } else if (preloadedQuestions) {
      // Questions were preloaded on the server
      setQuestions(preloadedQuestions)
      setIsLoading(false)
      setLoadingProgress(100)
    }
  }, [preloadedQuestions, shouldPreload])

  const hasQuestions = questions.technical.length > 0 || questions.behavioral.length > 0
  const totalQuestions = questions.technical.length + questions.behavioral.length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mock {interviewType === "phone-screener" ? "Phone Screener" : "First Interview"}</span>
            <div className="flex gap-2">
              {shouldPreload && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Fast Start
                </Badge>
              )}
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
                {shouldPreload && (
                  <p>
                    <strong>Preload Status:</strong>{" "}
                    {isLoading ? "Loading questions..." : hasQuestions ? "Questions ready!" : "Ready to load"}
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                  <div className="flex-1">
                    <div className="font-medium text-yellow-800">Preparing Interview Questions</div>
                    <div className="text-sm text-yellow-700">
                      Generating personalized questions based on the job description
                      {resume ? " and your resume" : ""}...
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Loading Progress</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  <Progress value={loadingProgress} className="w-full" />
                </div>
              </div>
            )}

            {/* Success State */}
            {!isLoading && hasQuestions && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-green-800">Questions Ready!</div>
                  <div className="text-sm text-green-700">
                    {totalQuestions} interview questions loaded ({questions.technical.length} technical,{" "}
                    {questions.behavioral.length} behavioral)
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Failed to Load Questions</AlertTitle>
                <AlertDescription>
                  {error}
                  <br />
                  <span className="text-sm">You can still start the interview, but questions will load on-demand.</span>
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
        interviewConfig={interviewConfig}
        interviewType={interviewType}
        isLoadingQuestions={isLoading}
        loadingQuestionsProgress={loadingProgress}
        questionsLoadingError={error}
        onRetryLoadQuestions={loadQuestions}
      />

      {/* Instructions */}
      {!isLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">
              {shouldPreload ? "Fast Start Interview" : "Standard Interview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-700">
              {shouldPreload ? (
                <>
                  <p className="font-medium">
                    ⚡ Questions have been pre-loaded for the fastest possible interview start!
                  </p>
                  <div className="space-y-2">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                      ✓
                    </div>
                    <p>Interview questions are ready and cached</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                      ✓
                    </div>
                    <p>Audio will generate in real-time for smooth conversation flow</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                      ✓
                    </div>
                    <p>Click "Start Phone Interview" to begin immediately</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium">Standard interview mode - questions will load as needed.</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                        1
                      </div>
                      <p>Questions will be generated when you start the interview</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                        2
                      </div>
                      <p>There may be a brief delay for the first question</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                        3
                      </div>
                      <p>Subsequent questions will load in the background</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
