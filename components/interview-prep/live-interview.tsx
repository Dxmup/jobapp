"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Phone,
  PhoneCall,
  Mic,
  Volume2,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  PhoneOff,
  MicIcon,
  TicketIcon as Queue,
  Rocket,
} from "lucide-react"
import {
  ConversationalInterviewClient,
  type ConversationalInterviewConfig,
} from "@/lib/conversational-interview-client"
import { generateInterviewQuestions } from "@/app/actions/interview-prep-actions"

interface LiveInterviewProps {
  job: any
  resume?: any
  questions: {
    technical: string[]
    behavioral: string[]
  }
  interviewType?: "phone-screener" | "first-interview"
  isPreloaded?: boolean
  userFirstName?: string
}

type InterviewState =
  | "ready"
  | "initializing"
  | "connecting"
  | "connected"
  | "playing_question"
  | "listening"
  | "user_speaking"
  | "user_silence"
  | "time_warning"
  | "ending"
  | "completed"
  | "error"

export function LiveInterview({
  job,
  resume,
  questions: initialQuestions,
  interviewType = "first-interview",
  isPreloaded = false,
  userFirstName,
}: LiveInterviewProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [interviewState, setInterviewState] = useState<InterviewState>("ready")
  const [interviewClient, setInterviewClient] = useState<ConversationalInterviewClient | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [remainingTime, setRemainingTime] = useState(
    interviewType === "phone-screener" ? 15 * 60 * 1000 : 30 * 60 * 1000,
  )
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [queueStatus, setQueueStatus] = useState({ queued: 0, ready: 0, generating: 0 })
  const [selectedVoice, setSelectedVoice] = useState<ConversationalInterviewConfig["voice"]>("Kore")
  const [memoryStatus, setMemoryStatus] = useState({ queueSize: 0, audioDataSize: 0, estimatedMemoryMB: 0 })

  const clientRef = useRef<ConversationalInterviewClient | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Configure interview based on type
  const maxDuration = interviewType === "phone-screener" ? 15 * 60 * 1000 : 30 * 60 * 1000 // 15 or 30 minutes
  const timeWarningAt = interviewType === "phone-screener" ? 12 * 60 * 1000 : 27 * 60 * 1000 // 3 minutes before end

  // Check if we have enough questions and required data
  const hasEnoughQuestions = questions.technical.length + questions.behavioral.length >= 3
  const canStartInterview = hasEnoughQuestions && job && interviewState === "ready"

  // Update questions when props change
  useEffect(() => {
    setQuestions(initialQuestions)
  }, [initialQuestions])

  // Auto-start logic - generate questions first, then auto-start

  // Auto-start interview after questions are ready

  // Debug logging
  useEffect(() => {
    console.log("🔍 LiveInterview state:", {
      technical: questions.technical.length,
      behavioral: questions.behavioral.length,
      total: questions.technical.length + questions.behavioral.length,
      interviewType,
      hasEnoughQuestions,
      isPreloaded,
      canStartInterview,
      userFirstName,
    })
  }, [questions, interviewType, hasEnoughQuestions, isPreloaded, canStartInterview, userFirstName])

  // Generate questions if not enough (fallback)
  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true)
    setError(null)

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

  // Randomly assign voice on component mount
  useEffect(() => {
    const voices: ConversationalInterviewConfig["voice"][] = ["Puck", "Charon", "Kore", "Fenrir", "Aoede"]
    const randomVoice = voices[Math.floor(Math.random() * voices.length)]
    setSelectedVoice(randomVoice)
    setRemainingTime(maxDuration)
  }, [maxDuration])

  // Start the conversational interview
  const startConversationalInterview = async () => {
    try {
      setError(null)
      setInterviewState("initializing")

      // Prepare job and resume context
      const jobContext = {
        company: job.company,
        title: job.title,
        description: job.description,
      }

      const resumeContext = {
        name: userFirstName || "liveInterview candidate", // Changed from "the candidate"
        title: resume?.title,
        experience: resume?.experience,
      }

      // Create interview client with type-specific configuration
      const client = await ConversationalInterviewClient.create(
        job.id,
        resume?.id,
        questions,
        jobContext,
        resumeContext,
        {
          voice: selectedVoice,
          maxDuration: maxDuration,
          timeWarningAt: timeWarningAt,
          silenceThreshold: 30, // Audio level threshold for silence detection
          silenceDuration: 750, // 0.75 seconds of silence
          queueSize: 3, // Keep 3 questions in queue
          interviewType: interviewType, // Pass the interview type
        },
        {
          onConnected: () => {
            console.log("✅ Connected to conversational interview")
            setInterviewState("connected")
          },
          onDisconnected: () => {
            console.log("🔗 Disconnected from conversational interview")
            if (interviewState !== "completed") {
              setInterviewState("completed")
            }
          },
          onError: (error) => {
            console.error("❌ Conversational interview error:", error)
            setError(error)
            setInterviewState("error")
          },
          onTimeWarning: (remainingMinutes) => {
            console.log(`⏰ Time warning: ${remainingMinutes} minutes remaining`)
            setInterviewState("time_warning")
            setTimeout(() => {
              if (interviewState === "time_warning") {
                setInterviewState("listening")
              }
            }, 3000)
          },
          onTimeUp: () => {
            console.log("⏰ Interview time limit reached")
            setInterviewState("ending")
          },
          onInterviewComplete: () => {
            console.log("🎉 Interview completed")
            setInterviewState("completed")
          },
          onQuestionStarted: (question, index, total) => {
            console.log(`❓ Question ${index}/${total}: ${question.substring(0, 50)}...`)
            setCurrentQuestion(question)
            setCurrentQuestionIndex(index)
            setTotalQuestions(total)
          },
          onQuestionAudioPlaying: () => {
            setInterviewState("playing_question")
          },
          onQuestionAudioComplete: () => {
            setInterviewState("listening")
          },
          onUserSpeaking: () => {
            setInterviewState("user_speaking")
          },
          onUserSilence: () => {
            setInterviewState("user_silence")
          },
          onUserResponseComplete: (duration) => {
            console.log(`✅ User response completed in ${duration}ms`)
            setInterviewState("connecting")
          },
          onAudioGenerationProgress: (current, total) => {
            console.log(`🎵 Audio generation progress: ${current}/${total}`)
          },
        },
      )

      clientRef.current = client
      setInterviewClient(client)

      setInterviewState("connecting")

      // Start the interview
      await client.startInterview()

      // Start duration timer
      startDurationTimer()

      console.log("🎙️ Conversational interview started successfully")
    } catch (error: any) {
      console.error("❌ Failed to start conversational interview:", error)
      setError(`Failed to start interview: ${error.message}`)
      setInterviewState("error")
    }
  }

  // Start duration timer and queue status updates
  const startDurationTimer = () => {
    durationTimerRef.current = setInterval(() => {
      if (clientRef.current && clientRef.current.isActive()) {
        const currentDuration = clientRef.current.getInterviewDuration()
        const remaining = clientRef.current.getRemainingTime()
        const status = clientRef.current.getQueueStatus()
        const memory = clientRef.current.getMemoryStatus()

        setDuration(currentDuration)
        setRemainingTime(remaining)
        setQueueStatus(status)
        setMemoryStatus(memory)
      }
    }, 1000)
  }

  // End interview manually
  const endInterview = () => {
    if (clientRef.current) {
      setInterviewState("ending")
      clientRef.current.endInterview()
    }
  }

  // Restart interview
  const restartInterview = () => {
    console.log("🔄 Restarting interview...")

    if (clientRef.current) {
      clientRef.current.forceCleanup()
    }

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }

    // Reset all state
    setInterviewClient(null)
    setInterviewState("ready")
    setError(null)
    setDuration(0)
    setRemainingTime(maxDuration)
    setCurrentQuestion("")
    setCurrentQuestionIndex(0)
    setTotalQuestions(0)
    setQueueStatus({ queued: 0, ready: 0, generating: 0 })
    setMemoryStatus({ queueSize: 0, audioDataSize: 0, estimatedMemoryMB: 0 })

    clientRef.current = null

    // Force garbage collection
    if (typeof window !== "undefined" && "gc" in window) {
      try {
        ;(window as any).gc()
      } catch (error) {
        // Ignore if gc is not available
      }
    }

    console.log("✅ Interview restart completed")
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.endInterview()
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
    }
  }, [])

  // Add this useEffect after the existing ones
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && clientRef.current && clientRef.current.isActive()) {
        console.log("👁️ Page hidden, pausing interview...")
        // Don't end the interview, but log that it's still running
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (clientRef.current && clientRef.current.isActive()) {
        console.log("🚪 Page unloading, cleaning up interview...")
        clientRef.current.forceCleanup()
        e.preventDefault()
        e.returnValue = ""
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  // Helper functions
  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getStateDisplay = () => {
    switch (interviewState) {
      case "ready":
        return isPreloaded ? "Ready for instant start!" : "Ready to start conversational interview"
      case "initializing":
        return "Initializing interview system..."
      case "connecting":
        return "Preparing next question..."
      case "connected":
        return "Connected - Starting interview..."
      case "playing_question":
        return "AI interviewer is speaking"
      case "listening":
        return "Your turn to speak - microphone is active"
      case "user_speaking":
        return "Listening to your response..."
      case "user_silence":
        return "Detected silence - processing your response..."
      case "time_warning":
        return "Time warning - 3 minutes remaining!"
      case "ending":
        return "Ending interview..."
      case "completed":
        return "Interview completed!"
      case "error":
        return "Interview error occurred"
      default:
        return interviewState
    }
  }

  const getStateIcon = () => {
    switch (interviewState) {
      case "ready":
        return isPreloaded ? <Rocket className="h-4 w-4 text-green-500" /> : <Phone className="h-4 w-4" />
      case "initializing":
      case "connecting":
      case "connected":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "playing_question":
        return <Volume2 className="h-4 w-4 text-blue-500" />
      case "listening":
        return <MicIcon className="h-4 w-4 text-green-500" />
      case "user_speaking":
        return <Mic className="h-4 w-4 text-green-500 animate-pulse" />
      case "user_silence":
        return <Mic className="h-4 w-4 text-yellow-500" />
      case "time_warning":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "ending":
        return <PhoneOff className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Phone className="h-4 w-4" />
    }
  }

  const isInterviewActive = ["playing_question", "listening", "user_speaking", "user_silence", "time_warning"].includes(
    interviewState,
  )
  const isConnecting = ["connecting", "connected", "initializing"].includes(interviewState)
  const isCompleted = interviewState === "completed"
  const hasError = interviewState === "error"

  const progress = duration > 0 ? (duration / maxDuration) * 100 : 0
  const questionProgress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {interviewType === "phone-screener" ? "Phone Screening Interview" : "Professional Phone Interview"}
            </span>
            <div className="flex gap-2">
              {isPreloaded && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-50 text-green-700 border-green-300"
                >
                  <Rocket className="h-3 w-3" />
                  Instant Start
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {interviewClient?.getInterviewerName() || "Alex"} ({selectedVoice} Voice)
              </Badge>
              <Badge variant="outline">Queue: 3 questions</Badge>
              <Badge variant="outline">{interviewType === "phone-screener" ? "15 min max" : "30 min max"}</Badge>
              {isInterviewActive && (
                <Badge variant="default" className="flex items-center gap-1">
                  <PhoneCall className="h-3 w-3" />
                  Live
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Question Generation Status */}
            {isGeneratingQuestions && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Generating Interview Questions</AlertTitle>
                <AlertDescription>
                  Creating personalized interview questions based on the job description and your resume...
                </AlertDescription>
              </Alert>
            )}

            {/* Warning if not enough questions */}
            {!hasEnoughQuestions && !isGeneratingQuestions && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not enough questions</AlertTitle>
                <AlertDescription>
                  {questions.technical.length + questions.behavioral.length > 0
                    ? `Only ${questions.technical.length + questions.behavioral.length} questions available. Need at least 3.`
                    : "No interview questions found."}
                  <div className="mt-3">
                    <Button onClick={handleGenerateQuestions} disabled={isGeneratingQuestions} size="sm">
                      {isGeneratingQuestions ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Questions
                        </>
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Interview Context */}
            {hasEnoughQuestions && (
              <div className={`p-4 rounded-lg ${isPreloaded ? "bg-green-50" : "bg-blue-50"}`}>
                <h3 className={`font-medium ${isPreloaded ? "text-green-900" : "text-blue-900"}`}>
                  {interviewType === "phone-screener" ? "Phone Screening Interview" : "Professional Phone Interview"}
                  {isPreloaded && " • Optimized & Ready"}
                </h3>
                <div className={`mt-2 text-sm ${isPreloaded ? "text-green-800" : "text-blue-800"}`}>
                  <p>
                    <strong>Interviewer:</strong> {interviewClient?.getInterviewerName() || "Alex"} from {job.company}
                  </p>
                  <p>
                    <strong>Position:</strong> {job.title}
                  </p>
                  <p>
                    <strong>Candidate:</strong> {userFirstName || resume?.name || "You"}
                  </p>
                  <p>
                    <strong>Questions Available:</strong> {questions.technical.length} technical,{" "}
                    {questions.behavioral.length} behavioral
                  </p>
                  <p>
                    <strong>Format:</strong>{" "}
                    {interviewType === "phone-screener"
                      ? "Brief phone screening focused on basic qualifications"
                      : "Professional phone interview with introduction and closing"}
                  </p>
                  <p>
                    <strong>Duration:</strong> {interviewType === "phone-screener" ? "15 minutes" : "30 minutes"}
                  </p>
                  {isPreloaded && (
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="text-green-700 font-medium">Fully optimized for instant start!</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Current State */}
            {hasEnoughQuestions && (
              <div
                className={`flex items-center gap-3 p-4 rounded-lg ${isPreloaded && interviewState === "ready" ? "bg-green-50" : "bg-gray-50"}`}
              >
                {getStateIcon()}
                <div className="flex-1">
                  <div className="font-medium">{getStateDisplay()}</div>
                  {currentQuestion && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {currentQuestionIndex === 1
                        ? "Introduction"
                        : `Question ${currentQuestionIndex}/${totalQuestions}`}
                      : {currentQuestion.substring(0, 100)}
                      {currentQuestion.length > 100 ? "..." : ""}
                    </div>
                  )}
                </div>
                {isInterviewActive && (
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatTime(remainingTime)} left</div>
                    <div className="text-xs text-muted-foreground">{formatTime(duration)} elapsed</div>
                  </div>
                )}
              </div>
            )}

            {/* Queue Status */}
            {(isInterviewActive || isConnecting) && queueStatus.queued > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Queue className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-800">Question Queue Status</div>
                  <div className="text-xs text-green-600">
                    {queueStatus.ready} ready • {queueStatus.generating} generating • {queueStatus.queued} total in
                    queue
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    Memory: {memoryStatus.audioDataSize} audio clips • ~{memoryStatus.estimatedMemoryMB}MB used • Queue:{" "}
                    {queueStatus.queued}/3
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bars */}
            {(isInterviewActive || isCompleted) && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Interview Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
                {totalQuestions > 0 && (
                  <div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Questions Progress</span>
                      <span>
                        {currentQuestionIndex}/{totalQuestions}
                      </span>
                    </div>
                    <Progress value={questionProgress} className="w-full" />
                  </div>
                )}
              </div>
            )}

            {/* Voice Activity Indicator */}
            {isInterviewActive && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      interviewState === "playing_question" ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                  <span>Alex Speaking</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      ["listening", "user_speaking", "user_silence"].includes(interviewState)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span>Your Microphone</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      interviewState === "user_speaking" ? "bg-green-500 animate-pulse" : "bg-gray-300"
                    }`}
                  />
                  <span>Voice Detected</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center gap-4">
            {canStartInterview && (
              <Button
                onClick={startConversationalInterview}
                size="lg"
                className={`${isPreloaded ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {isPreloaded ? <Rocket className="h-4 w-4 mr-2" /> : <PhoneCall className="h-4 w-4 mr-2" />}
                {isPreloaded ? "Instant Start" : "Start"}{" "}
                {interviewType === "phone-screener" ? "Phone Screening" : "Phone Interview"}
              </Button>
            )}

            {isConnecting && (
              <Button disabled size="lg">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {interviewState === "initializing" ? "Initializing..." : "Preparing..."}
              </Button>
            )}

            {isInterviewActive && (
              <Button onClick={endInterview} variant="destructive" size="lg">
                <PhoneOff className="h-4 w-4 mr-2" />
                End Interview
              </Button>
            )}

            {(isCompleted || hasError) && (
              <Button onClick={restartInterview} size="lg">
                <Phone className="h-4 w-4 mr-2" />
                Start New Interview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {hasError && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Interview Error</AlertTitle>
          <AlertDescription>
            {error}
            <br />
            <span className="text-sm">Please try again later or contact support if the problem persists.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Interview Completed */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {interviewType === "phone-screener" ? "Phone Screening" : "Phone Interview"} Completed! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700">
                Excellent work! You've completed a{" "}
                {interviewType === "phone-screener" ? "phone screening" : "professional phone interview"} with{" "}
                {interviewClient?.getInterviewerName() || "Alex"} from {job.company} for the {job.title} position.
              </p>
              <div className="flex gap-4 text-sm text-green-600">
                <div>
                  <span className="font-medium">Duration:</span> {formatTime(duration)}
                </div>
                <div>
                  <span className="font-medium">Questions:</span> {currentQuestionIndex}/{totalQuestions}
                </div>
                <div>
                  <span className="font-medium">Interviewer:</span> {interviewClient?.getInterviewerName() || "Alex"} (
                  {selectedVoice})
                </div>
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  {interviewType === "phone-screener" ? "Phone Screening" : "Professional Interview"}
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>What's Next:</strong>{" "}
                  {interviewType === "phone-screener"
                    ? "This was a realistic phone screening focused on basic qualifications and fit. In real screenings, be prepared to discuss your background briefly and show genuine interest in the role."
                    : "This was a realistic phone interview simulation with proper introduction and closing. In real interviews, remember to speak clearly, ask clarifying questions, and maintain professional enthusiasm throughout."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {interviewState === "ready" && hasEnoughQuestions && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">
              How {interviewType === "phone-screener" ? "Phone Screening" : "Professional Phone Interview"} Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <p>The interviewer will introduce themselves and explain the interview process</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <p>
                  Questions are asked{" "}
                  {interviewType === "phone-screener"
                    ? "concisely, focusing on basic qualifications and fit"
                    : "professionally with natural conversation flow"}
                </p>
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
                <p>Silence detection (0.75s) automatically moves to the next question</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                  5
                </div>
                <p>
                  Interview concludes with{" "}
                  {interviewType === "phone-screener"
                    ? "brief closing and timeline expectations"
                    : "professional closing and next steps"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
