"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Phone, PhoneCall, Mic, Volume2, Clock, Zap, AlertCircle, CheckCircle, Loader2, PhoneOff } from "lucide-react"
import { LiveInterviewClient, type LiveInterviewConfig } from "@/lib/live-interview-client"
import { SimpleMockInterview } from "@/components/interview-prep/simple-mock-interview"

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
  | "connecting"
  | "connected"
  | "active"
  | "time_warning"
  | "ending"
  | "completed"
  | "error"

export function LiveInterview({ job, resume, questions }: LiveInterviewProps) {
  const [interviewState, setInterviewState] = useState<InterviewState>("ready")
  const [interviewClient, setInterviewClient] = useState<LiveInterviewClient | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [remainingTime, setRemainingTime] = useState(15 * 60 * 1000) // 15 minutes
  const [isAudioActive, setIsAudioActive] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<LiveInterviewConfig["voice"]>("Kore")
  const [useFallback, setUseFallback] = useState(false)

  const clientRef = useRef<LiveInterviewClient | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)

  if (useFallback) {
    return <SimpleMockInterview job={job} resume={resume} questions={questions} />
  }

  // Check if we have enough questions and required data
  const hasEnoughQuestions = questions.technical.length > 0 || questions.behavioral.length > 0
  const canStartInterview = hasEnoughQuestions && job && interviewState === "ready"

  // Randomly assign voice on component mount
  useEffect(() => {
    const voices: LiveInterviewConfig["voice"][] = ["Puck", "Charon", "Kore", "Fenrir", "Aoede"]
    const randomVoice = voices[Math.floor(Math.random() * voices.length)]
    setSelectedVoice(randomVoice)
  }, [])

  // Start the live interview
  const startLiveInterview = async () => {
    try {
      setError(null)
      setInterviewState("connecting")

      // Create interview client using secure factory method
      const client = await LiveInterviewClient.create(
        job.id,
        resume?.id,
        questions,
        {
          voice: selectedVoice,
          maxDuration: 15 * 60 * 1000, // 15 minutes
          timeWarningAt: 12 * 60 * 1000, // 12 minutes
        },
        {
          onConnected: () => {
            console.log("✅ Connected to live interview")
            setInterviewState("connected")
          },
          onDisconnected: () => {
            console.log("🔗 Disconnected from live interview")
            if (interviewState === "active") {
              setInterviewState("completed")
            }
          },
          onError: (error) => {
            console.error("❌ Live interview error:", error)
            setError(error)
            setInterviewState("error")
            setUseFallback(true)
          },
          onTimeWarning: (remainingMinutes) => {
            console.log(`⏰ Time warning: ${remainingMinutes} minutes remaining`)
            setInterviewState("time_warning")
            // Return to active state after showing warning
            setTimeout(() => {
              if (interviewState === "time_warning") {
                setInterviewState("active")
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
          onAudioReceived: (audioData) => {
            setIsAudioActive(true)
            // Reset audio indicator after a short delay
            setTimeout(() => setIsAudioActive(false), 1000)
          },
        },
      )

      clientRef.current = client
      setInterviewClient(client)

      // Start the interview
      await client.startInterview()
      setInterviewState("active")

      // Start duration timer
      startDurationTimer()

      console.log("🎙️ Live interview started successfully")
    } catch (error: any) {
      console.error("❌ Failed to start live interview:", error)
      setError(`Failed to start interview: ${error.message}`)
      setInterviewState("error")
      setUseFallback(true)
    }
  }

  // Start duration timer
  const startDurationTimer = () => {
    durationTimerRef.current = setInterval(() => {
      if (clientRef.current && clientRef.current.isActive()) {
        const currentDuration = clientRef.current.getInterviewDuration()
        const remaining = clientRef.current.getRemainingTime()
        setDuration(currentDuration)
        setRemainingTime(remaining)
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
    setIsAudioActive(false)
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
        return "Ready to start live interview"
      case "connecting":
        return "Connecting to interview service..."
      case "connected":
        return "Connected - Starting interview..."
      case "active":
        return "Live interview in progress"
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
      case "connecting":
      case "connected":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "active":
        return isAudioActive ? (
          <Volume2 className="h-4 w-4 text-green-500" />
        ) : (
          <Mic className="h-4 w-4 text-blue-500" />
        )
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

  const isInterviewActive = ["active", "time_warning"].includes(interviewState)
  const isConnecting = ["connecting", "connected"].includes(interviewState)
  const isCompleted = interviewState === "completed"
  const hasError = interviewState === "error"

  const progress = duration > 0 ? (duration / (15 * 60 * 1000)) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live AI Interview</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {selectedVoice} Voice
              </Badge>
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
              <h3 className="font-medium text-blue-900">Live Interview Context</h3>
              <div className="mt-2 text-sm text-blue-800">
                <p>
                  <strong>Company:</strong> {job.company}
                </p>
                <p>
                  <strong>Position:</strong> {job.title}
                </p>
                {resume && (
                  <p>
                    <strong>Resume:</strong> {resume.title || "Selected"}
                  </p>
                )}
                <p>
                  <strong>Questions Available:</strong> {questions.technical.length} technical,{" "}
                  {questions.behavioral.length} behavioral
                </p>
                <p>
                  <strong>AI Interviewer:</strong> {selectedVoice} (Professional tone)
                </p>
              </div>
            </div>

            {/* Current State */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {getStateIcon()}
              <div className="flex-1">
                <div className="font-medium">{getStateDisplay()}</div>
                {interviewState === "active" && (
                  <div className="text-sm text-muted-foreground">
                    Speak naturally - this is a real-time conversation with AI
                  </div>
                )}
                {interviewState === "time_warning" && (
                  <div className="text-sm text-orange-600 font-medium">
                    The interview will end automatically in 3 minutes
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

            {/* Progress Bar */}
            {(isInterviewActive || isCompleted) && (
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Interview Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Audio Indicator */}
            {isInterviewActive && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isAudioActive ? "bg-green-500" : "bg-gray-300"}`} />
                  <span>AI Speaking</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mic className="h-3 w-3 text-blue-500" />
                  <span>Your Microphone Active</span>
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
              <Button onClick={startLiveInterview} size="lg" className="bg-green-600 hover:bg-green-700">
                <PhoneCall className="h-4 w-4 mr-2" />
                Start Live Interview
              </Button>
            )}

            {isConnecting && (
              <Button disabled size="lg">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
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
              Live Interview Completed! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700">
                Excellent work! You've completed a live AI interview for {job.title} at {job.company}.
              </p>
              <div className="flex gap-4 text-sm text-green-600">
                <div>
                  <span className="font-medium">Duration:</span> {formatTime(duration)}
                </div>
                <div>
                  <span className="font-medium">AI Interviewer:</span> {selectedVoice}
                </div>
                <div>
                  <span className="font-medium">Format:</span> Live Audio Conversation
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>What's Next:</strong> This was a practice interview to help you prepare. In a real interview,
                  remember to speak clearly, take your time to think, and ask clarifying questions when needed.
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
            <CardTitle className="text-blue-800">How Live Interview Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <p>Click "Start Live Interview" to connect to the AI interviewer</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <p>The AI will introduce itself and begin asking questions naturally</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <p>Speak naturally - this is a real-time conversation, just like a phone interview</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                  4
                </div>
                <p>The AI will ask follow-up questions and keep the conversation on track</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                  5
                </div>
                <p>Interview automatically ends after 15 minutes or when naturally concluded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
