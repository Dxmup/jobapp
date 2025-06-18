"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Mic, Volume2, Clock, Zap, Speaker, Loader2, Pause, Play, SkipForward, AlertCircle, Phone } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ConversationFlowManager, type ConversationState } from "@/lib/conversation-flow-manager"

interface MockInterviewProps {
  job: any
  resume?: any
  questions: {
    technical: string[]
    behavioral: string[]
  }
}

export function SimpleMockInterview({ job, resume, questions }: MockInterviewProps) {
  const [conversationManager, setConversationManager] = useState<ConversationFlowManager | null>(null)
  const [conversationState, setConversationState] = useState<ConversationState>("initializing")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [personality, setPersonality] = useState({ voice: "", tone: "" })
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)
  const [queueStatus, setQueueStatus] = useState({ total: 0, ready: 0, loading: 0, current: 0 })
  const [audioProgress, setAudioProgress] = useState({ current: 0, duration: 0 })
  const [isInitialized, setIsInitialized] = useState(false)

  const managerRef = useRef<ConversationFlowManager | null>(null)

  // Check if we have enough questions
  const hasEnoughQuestions = questions.technical.length > 0 || questions.behavioral.length > 0

  // Prepare interview questions
  const prepareQuestions = () => {
    const introduction = createIntroduction(job, resume)
    const selectedTechnical = questions.technical
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(3, questions.technical.length))
    const selectedBehavioral = questions.behavioral
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(3, questions.behavioral.length))
    const closing = createClosing(job)

    return [
      { type: "introduction", text: introduction, index: 0 },
      ...selectedTechnical.map((q, i) => ({ type: "technical", text: q, index: i + 1 })),
      ...selectedBehavioral.map((q, i) => ({
        type: "behavioral",
        text: q,
        index: i + 1 + selectedTechnical.length,
      })),
      { type: "closing", text: closing, index: selectedTechnical.length + selectedBehavioral.length + 1 },
    ]
  }

  // Initialize the conversation
  const initializeConversation = async () => {
    try {
      setError(null)

      const manager = new ConversationFlowManager(
        {
          responseDelay: 1500,
          listeningStartDelay: 500,
          silenceThreshold: 0.01,
          maxResponseTime: 120000,
        },
        {
          onStateChange: (state) => {
            console.log("🔄 State changed to:", state)
            setConversationState(state)

            // Update personality when assigned
            if (state === "preloading_questions" && managerRef.current) {
              setPersonality(managerRef.current.getPersonality())
            }
          },
          onQuestionChange: (questionIndex, total) => {
            setCurrentQuestionIndex(questionIndex)
            setTotalQuestions(total)
          },
          onAudioProgress: (current, duration) => {
            setAudioProgress({ current, duration })
          },
          onError: (error) => {
            setError(error)
          },
          onComplete: () => {
            console.log("🎉 Interview completed!")
          },
          onVolumeChange: (vol) => {
            setVolume(vol)
          },
        },
      )

      managerRef.current = manager
      setConversationManager(manager)

      const interviewQuestions = prepareQuestions()
      setTotalQuestions(interviewQuestions.length)

      await manager.initialize(interviewQuestions)
      setIsInitialized(true)

      // Update queue status periodically
      const statusInterval = setInterval(() => {
        if (managerRef.current) {
          setQueueStatus(managerRef.current.getQueueStatus())
        }
      }, 1000)

      // Cleanup interval on unmount
      return () => clearInterval(statusInterval)
    } catch (error: any) {
      console.error("❌ Failed to initialize conversation:", error)
      setError(`Failed to initialize: ${error.message}`)
    }
  }

  // Start the interview
  const startInterview = async () => {
    if (conversationManager) {
      try {
        await conversationManager.startConversation()
      } catch (error: any) {
        setError(`Failed to start interview: ${error.message}`)
      }
    }
  }

  // Control functions
  const pauseInterview = () => {
    conversationManager?.pause()
  }

  const resumeInterview = () => {
    conversationManager?.resume()
  }

  const skipQuestion = () => {
    conversationManager?.skipQuestion()
  }

  const restartInterview = () => {
    if (conversationManager) {
      conversationManager.destroy()
    }
    setConversationManager(null)
    setConversationState("initializing")
    setCurrentQuestionIndex(0)
    setTotalQuestions(0)
    setPersonality({ voice: "", tone: "" })
    setError(null)
    setIsInitialized(false)
    managerRef.current = null
  }

  // Initialize on mount
  useEffect(() => {
    if (hasEnoughQuestions && !conversationManager) {
      initializeConversation()
    }

    // Cleanup on unmount
    return () => {
      if (managerRef.current) {
        managerRef.current.destroy()
      }
    }
  }, [hasEnoughQuestions])

  // Helper functions
  const createIntroduction = (job: any, resume?: any) => {
    let intro = `Hello! I'm calling from ${job.company} regarding your application for the ${job.title} position. `
    if (resume) {
      intro += `I've reviewed your resume and I'm impressed with your background. `
    }
    intro += `I'd like to ask you a few questions to learn more about your experience and skills. Are you ready to begin?`
    return intro
  }

  const createClosing = (job: any) => {
    return `Thank you for your time today. We're looking for someone who can really contribute to our team at ${job.company}. I've made notes about your responses, and our hiring team will review them. Do you have any questions for me about the ${job.title} position or next steps in our process?`
  }

  // State-based UI helpers
  const getStateDisplay = () => {
    switch (conversationState) {
      case "initializing":
        return "Initializing interview system..."
      case "assigning_personality":
        return "Assigning interviewer personality..."
      case "loading_intro":
        return "Loading introduction..."
      case "preloading_questions":
        return "Preparing interview questions..."
      case "ready_for_question":
        return "Ready to start interview"
      case "playing_question":
        return "Interviewer is speaking"
      case "waiting_to_listen":
        return "Preparing to listen..."
      case "listening_for_response":
        return "Listening for your response"
      case "processing_silence":
        return "Processing your response..."
      case "preparing_next":
        return "Preparing next question..."
      case "interview_complete":
        return "Interview completed!"
      case "paused":
        return "Interview paused"
      case "error":
        return "Error occurred"
      default:
        return conversationState
    }
  }

  const getStateIcon = () => {
    switch (conversationState) {
      case "playing_question":
        return <Volume2 className="h-4 w-4" />
      case "listening_for_response":
        return <Mic className="h-4 w-4" />
      case "processing_silence":
        return <Clock className="h-4 w-4" />
      case "interview_complete":
        return <Phone className="h-4 w-4" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />
    }
  }

  const isInterviewActive = [
    "playing_question",
    "waiting_to_listen",
    "listening_for_response",
    "processing_silence",
    "preparing_next",
  ].includes(conversationState)
  const canStart = conversationState === "ready_for_question"
  const canPause = isInterviewActive && conversationState !== "paused"
  const canResume = conversationState === "paused"
  const canSkip = conversationState === "listening_for_response"
  const isCompleted = conversationState === "interview_complete"

  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Automated Mock Phone Interview</span>
            <div className="flex gap-2">
              {personality.voice && (
                <>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Speaker className="h-3 w-3" />
                    {personality.voice}
                  </Badge>
                  <Badge variant="outline">{personality.tone}</Badge>
                </>
              )}
              {queueStatus.ready > 0 && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {queueStatus.ready}/{queueStatus.total} Ready
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

            {/* Job Context */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Interview Context</h3>
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
                  <strong>Questions:</strong> {questions.technical.length} technical, {questions.behavioral.length}{" "}
                  behavioral
                </p>
              </div>
            </div>

            {/* Current State */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {getStateIcon()}
              <div>
                <div className="font-medium">{getStateDisplay()}</div>
                {conversationState === "listening_for_response" && (
                  <div className="text-sm text-muted-foreground">
                    Speak naturally - I'll detect when you're finished
                  </div>
                )}
              </div>
              {volume > 0 && conversationState === "listening_for_response" && (
                <div className="ml-auto">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-100"
                      style={{ width: `${Math.min(volume * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}
            {totalQuestions > 0 && (
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Interview Progress</span>
                  <span>
                    {currentQuestionIndex + 1} / {totalQuestions}
                  </span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Audio Progress */}
            {conversationState === "playing_question" && audioProgress.duration > 0 && (
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Question Audio</span>
                  <span>
                    {Math.round(audioProgress.current)}s / {Math.round(audioProgress.duration)}s
                  </span>
                </div>
                <Progress value={(audioProgress.current / audioProgress.duration) * 100} className="w-full h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center gap-4">
            {canStart && (
              <Button onClick={startInterview} size="lg" className="bg-green-600 hover:bg-green-700">
                <Phone className="h-4 w-4 mr-2" />
                Start Phone Interview
              </Button>
            )}

            {canPause && (
              <Button onClick={pauseInterview} variant="outline" size="lg">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}

            {canResume && (
              <Button onClick={resumeInterview} size="lg">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}

            {canSkip && (
              <Button onClick={skipQuestion} variant="outline">
                <SkipForward className="h-4 w-4 mr-2" />
                I'm Done Speaking
              </Button>
            )}

            {(isCompleted || error) && (
              <Button onClick={restartInterview} size="lg">
                Start New Interview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Interview Completed */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Interview Completed! 🎉</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700">
                Great job! You've completed the automated mock interview for {job.title} at {job.company}.
              </p>
              <div className="flex gap-4 text-sm text-green-600">
                <div>
                  <span className="font-medium">Questions:</span> {totalQuestions}
                </div>
                <div>
                  <span className="font-medium">Interviewer:</span> {personality.voice} ({personality.tone})
                </div>
                <div>
                  <span className="font-medium">Audio Generated:</span> {queueStatus.ready}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1 text-gray-600">
              <div>State: {conversationState}</div>
              <div>
                Question: {currentQuestionIndex + 1}/{totalQuestions}
              </div>
              <div>
                Queue: {queueStatus.ready}/{queueStatus.total} ready, {queueStatus.loading} loading
              </div>
              <div>Volume: {(volume * 100).toFixed(1)}%</div>
              <div>
                Personality: {personality.voice} ({personality.tone})
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
