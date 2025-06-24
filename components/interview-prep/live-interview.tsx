"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Mic,
  Phone,
  PhoneOff,
  Clock,
  User,
  Briefcase,
  Volume2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  BarChart3,
} from "lucide-react"
import {
  ConversationalInterviewClient,
  type ConversationalInterviewConfig,
  type ConversationalInterviewCallbacks,
} from "@/lib/conversational-interview-client"

interface LiveInterviewProps {
  job: any
  resume?: string
  questions: { technical: string[]; behavioral: string[] }
  userName?: string
  userFirstName?: string
}

export function LiveInterview({ job, resume, questions, userName, userFirstName }: LiveInterviewProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [interviewDuration, setInterviewDuration] = useState(0)
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioGenerationProgress, setAudioGenerationProgress] = useState({ current: 0, total: 0 })
  const [memoryStatus, setMemoryStatus] = useState({
    queueSize: 0,
    audioDataSize: 0,
    estimatedMemoryMB: 0,
    audioFormat: "",
    totalProcessed: 0,
  })
  const [interviewerName, setInterviewerName] = useState("")
  const [showAdvancedStats, setShowAdvancedStats] = useState(false)

  const clientRef = useRef<ConversationalInterviewClient | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get the candidate name - prioritize userFirstName, then userName, then fallback
  const candidateName = userFirstName || userName || "the candidate"

  console.log(`🎭 LiveInterview received props:`, {
    userName,
    userFirstName,
    candidateName,
    jobTitle: job?.title,
    resumeId: resume,
  })

  const config: ConversationalInterviewConfig = {
    voice: "Aoede",
    maxDuration: 15 * 60 * 1000, // 15 minutes
    timeWarningAt: 12 * 60 * 1000, // Warning at 12 minutes
    silenceThreshold: 30,
    silenceDuration: 3000, // 3 seconds of silence
    queueSize: 5,
    interviewType: "phone-screener",
  }

  const callbacks: ConversationalInterviewCallbacks = {
    onConnected: useCallback(() => {
      console.log("🔗 Interview client connected")
      setIsConnected(true)
      setError(null)
    }, []),

    onDisconnected: useCallback(() => {
      console.log("🔌 Interview client disconnected")
      setIsConnected(false)
      setIsActive(false)
      setIsPlayingQuestion(false)
      setIsListening(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, []),

    onError: useCallback((errorMessage: string) => {
      console.error("❌ Interview error:", errorMessage)
      setError(errorMessage)
      setIsActive(false)
    }, []),

    onTimeWarning: useCallback((remainingMinutes: number) => {
      console.log(`⏰ Time warning: ${remainingMinutes} minutes remaining`)
    }, []),

    onTimeUp: useCallback(() => {
      console.log("⏰ Time is up!")
      setError("Interview time limit reached")
    }, []),

    onInterviewComplete: useCallback(() => {
      console.log("🎉 Interview completed successfully")
      setIsActive(false)
    }, []),

    onQuestionStarted: useCallback((question: string, index: number, total: number) => {
      console.log(`❓ Question ${index}/${total}: ${question.substring(0, 50)}...`)
      setCurrentQuestion(question)
      setQuestionIndex(index)
      setTotalQuestions(total)
    }, []),

    onQuestionAudioPlaying: useCallback(() => {
      console.log("🎵 Question audio started playing")
      setIsPlayingQuestion(true)
    }, []),

    onQuestionAudioComplete: useCallback(() => {
      console.log("✅ Question audio finished playing")
      setIsPlayingQuestion(false)
    }, []),

    onUserSpeaking: useCallback(() => {
      setIsListening(true)
    }, []),

    onUserSilence: useCallback(() => {
      // Keep listening state until response is complete
    }, []),

    onUserResponseComplete: useCallback((duration: number) => {
      console.log(`✅ User response completed (${duration}ms)`)
      setIsListening(false)
    }, []),

    onAudioGenerationProgress: useCallback((current: number, total: number) => {
      setAudioGenerationProgress({ current, total })
    }, []),
  }

  // Update time and memory status
  useEffect(() => {
    if (isActive && clientRef.current) {
      intervalRef.current = setInterval(() => {
        const client = clientRef.current
        if (client && client.isActive()) {
          setTimeRemaining(client.getRemainingTime())
          setInterviewDuration(client.getInterviewDuration())
          setMemoryStatus(client.getMemoryStatus())
        }
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive])

  const startInterview = async () => {
    try {
      setError(null)
      console.log("🚀 Starting live interview...")
      console.log(`👤 Using candidate name: "${candidateName}"`)

      // Create the interview client with proper context
      const client = await ConversationalInterviewClient.create(
        job.id,
        resume,
        questions,
        {
          title: job.title,
          company: job.company,
          description: job.description,
        },
        {
          name: candidateName, // This is the key - pass the actual name here
          resumeId: resume,
        },
        config,
        callbacks,
      )

      clientRef.current = client
      setInterviewerName(client.getInterviewerName())

      // Start the interview
      await client.startInterview()
      setIsActive(true)

      console.log(`✅ Interview started with interviewer: ${client.getInterviewerName()}`)
      console.log(`👤 Candidate name in context: "${candidateName}"`)
    } catch (error: any) {
      console.error("❌ Failed to start interview:", error)
      setError(`Failed to start interview: ${error.message}`)
    }
  }

  const endInterview = () => {
    console.log("🛑 Ending interview...")
    if (clientRef.current) {
      clientRef.current.endInterview()
      clientRef.current = null
    }
    setIsActive(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        console.log("🧹 Cleaning up interview client on unmount")
        clientRef.current.forceCleanup()
      }
    }
  }, [])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getStatusColor = () => {
    if (error) return "destructive"
    if (isPlayingQuestion) return "default"
    if (isListening) return "secondary"
    if (isActive) return "default"
    return "outline"
  }

  const getStatusText = () => {
    if (error) return "Error"
    if (isPlayingQuestion) return "Interviewer Speaking"
    if (isListening) return "Listening to You"
    if (isActive) return "Interview Active"
    if (isConnected) return "Ready to Start"
    return "Disconnected"
  }

  const getStatusIcon = () => {
    if (error) return <XCircle className="h-4 w-4" />
    if (isPlayingQuestion) return <Volume2 className="h-4 w-4" />
    if (isListening) return <Mic className="h-4 w-4" />
    if (isActive) return <CheckCircle className="h-4 w-4" />
    return <Phone className="h-4 w-4" />
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Live AI Interview
            {interviewerName && (
              <span className="text-sm font-normal text-muted-foreground">with {interviewerName}</span>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowAdvancedStats(!showAdvancedStats)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
          {candidateName !== "the candidate" && (
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {candidateName}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {/* Job Context */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>
            {job.title} at {job.company}
          </span>
        </div>

        {/* Progress and Time */}
        {isActive && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>
                Question {questionIndex} of {totalQuestions}
              </span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeRemaining)} remaining</span>
              </div>
            </div>

            {totalQuestions > 0 && <Progress value={(questionIndex / totalQuestions) * 100} className="h-2" />}
          </div>
        )}

        {/* Current Question */}
        {currentQuestion && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Current Question:</p>
            <p className="text-sm">{currentQuestion}</p>
          </div>
        )}

        {/* Audio Generation Progress */}
        {audioGenerationProgress.total > 0 && audioGenerationProgress.current < audioGenerationProgress.total && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                Generating audio... ({audioGenerationProgress.current}/{audioGenerationProgress.total})
              </span>
            </div>
            <Progress value={(audioGenerationProgress.current / audioGenerationProgress.total) * 100} className="h-1" />
          </div>
        )}

        {/* Advanced Stats */}
        {showAdvancedStats && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4" />
              Advanced Statistics
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Queue Size:</span>
                <span className="ml-2 font-mono">{memoryStatus.queueSize}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Audio Ready:</span>
                <span className="ml-2 font-mono">{memoryStatus.audioDataSize}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Memory Usage:</span>
                <span className="ml-2 font-mono">{memoryStatus.estimatedMemoryMB}MB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Processed:</span>
                <span className="ml-2 font-mono">{memoryStatus.totalProcessed}</span>
              </div>
            </div>
            {memoryStatus.audioFormat && (
              <div className="text-xs">
                <span className="text-muted-foreground">Audio Format:</span>
                <span className="ml-2 font-mono">{memoryStatus.audioFormat}</span>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Controls */}
        <div className="flex gap-3">
          {!isActive ? (
            <Button onClick={startInterview} disabled={!isConnected} className="flex-1">
              <Phone className="mr-2 h-4 w-4" />
              Start Interview
            </Button>
          ) : (
            <Button onClick={endInterview} variant="destructive" className="flex-1">
              <PhoneOff className="mr-2 h-4 w-4" />
              End Interview
            </Button>
          )}
        </div>

        {/* Instructions */}
        {!isActive && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• This is a {config.maxDuration / 60000}-minute phone screening simulation</p>
            <p>• Speak naturally when prompted - the AI will detect when you finish</p>
            <p>• Questions are adapted for screening (brief, high-level responses expected)</p>
            {candidateName !== "the candidate" && <p>• The interviewer will address you as "{candidateName}"</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
