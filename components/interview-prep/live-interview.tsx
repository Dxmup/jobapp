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
} from "lucide-react"
import {
  ConversationalInterviewClient,
  type ConversationalInterviewConfig,
} from "@/lib/conversational-interview-client"

interface LiveInterviewProps {
  job: any
  resume?: any
  questions: {
    technical: string[]
    behavioral: string[]
  }
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

export function LiveInterview({ job, resume, questions }: LiveInterviewProps) {
  const [interviewState, setInterviewState] = useState<InterviewState>("ready")
  const [interviewClient, setInterviewClient] = useState<ConversationalInterviewClient | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [remainingTime, setRemainingTime] = useState(15 * 60 * 1000) // 15 minutes
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [queueStatus, setQueueStatus] = useState({ queued: 0, ready: 0, generating: 0 })
  const [selectedVoice, setSelectedVoice] = useState<ConversationalInterviewConfig["voice"]>("Kore")
  const [memoryStatus, setMemoryStatus] = useState({ queueSize: 0, audioDataSize: 0, estimatedMemoryMB: 0 })

  const clientRef = useRef<ConversationalInterviewClient | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check if we have enough questions and required data
  const hasEnoughQuestions = questions.technical.length > 0 || questions.behavioral.length > 0
  const canStartInterview = hasEnoughQuestions && job && interviewState === "ready"

  // Randomly assign voice on component mount
  useEffect(() => {
    const voices: ConversationalInterviewConfig["voice"][] = ["Puck", "Charon", "Kore", "Fenrir", "Aoede"]
    const randomVoice = voices[Math.floor(Math.random() * voices.length)]
    setSelectedVoice(randomVoice)
  }, [])

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
        name: resume?.name || "the candidate",
        title: resume?.title,
        experience: resume?.experience,
      }

      // Create interview client
      const client = await ConversationalInterviewClient.create(
        job.id,
        resume?.id,
        questions,
        jobContext,
        resumeContext,
        {
          voice: selectedVoice,
          maxDuration: 15 * 60 * 1000, // 15 minutes
          timeWarningAt: 12 * 60 * 1000, // 12 minutes
          silenceThreshold: 30, // Audio level threshold for silence detection
          silenceDuration: 750, // 0.75 seconds of silence
          queueSize: 8, // Keep 8 questions in queue
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
    if (clientRef.current) {
      clientRef.current.endInterview()
    }
    setInterviewClient(null)
    setInterviewState("ready")
    setError(null)
    setDuration(0)
    setRemainingTime(15 * 60 * 1000)
    setCurrentQuestion("")
    setCurrentQuestionIndex(0)
    setTotalQuestions(0)
    setQueueStatus({ queued: 0, ready: 0, generating: 0 })
    clientRef.current = null

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }
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

  // Helper functions
  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getStateDisplay = () => {
    switch (interviewState) {
      case "ready":
        return "Ready to start conversational interview"
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
        return <Phone className="h-4 w-4" />
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

  const progress = duration > 0 ? (duration / (15 * 60 * 1000)) * 100 : 0
  const questionProgress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Professional Phone Interview</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {interviewClient?.getInterviewerName() || "Alex"} ({selectedVoice} Voice)
              </Badge>
              <Badge variant="outline">Queue: 8 questions</Badge>
              <Badge variant="outline">15 min max</Badge>
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
            {/* Warning if not enough questions */}
            {!hasEnoughQuestions && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not enough questions</AlertTitle>
                <AlertDescription>
                  There aren't enough interview questions available. Please generate more questions first.
                </AlertDescription>
              </Alert>
            )}

            {/* Interview Context */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Professional Phone Interview</h3>
              <div className="mt-2 text-sm text-blue-800">
                <p>
                  <strong>Interviewer:</strong> {interviewClient?.getInterviewerName() || "Alex"} from {job.company}
                </p>
                <p>
                  <strong>Position:</strong> {job.title}
                </p>
                <p>
                  <strong>Candidate:</strong> {resume?.name || "You"}
                </p>
                <p>
                  <strong>Questions Available:</strong> {questions.technical.length} technical,{" "}
                  {questions.behavioral.length} behavioral
                </p>
                <p>
                  <strong>Format:</strong> Professional phone screening with introduction and closing
                </p>
              </div>
            </div>

            {/* Current State */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {getStateIcon()}
              <div className="flex-1">
                <div className="font-medium">{getStateDisplay()}</div>
                {currentQuestion && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {currentQuestionIndex === 1 ? "Introduction" : `Question ${currentQuestionIndex}/${totalQuestions}`}
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
                    Memory: {memoryStatus.audioDataSize} audio clips • ~{memoryStatus.estimatedMemoryMB}MB used
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
              <Button onClick={startConversationalInterview} size="lg" className="bg-green-600 hover:bg-green-700">
                <PhoneCall className="h-4 w-4 mr-2" />
                Start Phone Interview
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
              Phone Interview Completed! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700">
                Excellent work! You've completed a professional phone interview with{" "}
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
                  <span className="font-medium">Format:</span> Professional Phone Screening
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>What's Next:</strong> This was a realistic phone interview simulation with proper introduction
                  and closing. In real interviews, remember to speak clearly, ask clarifying questions, and maintain
                  professional enthusiasm throughout.
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
            <CardTitle className="text-blue-800">How Professional Phone Interview Works</CardTitle>
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
                <p>Questions are asked professionally with natural conversation flow</p>
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
                <p>Interview concludes with professional closing and next steps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
