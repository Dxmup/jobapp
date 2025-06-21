"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useMutation } from "@tanstack/react-query"
import { startInterview } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface LiveInterviewProps {
  job: any
  resume?: any
  questions: {
    technical: string[]
    behavioral: string[]
  }
  interviewType?: "phone-screener" | "first-interview"
}

interface ConversationalInterviewConfig {
  voice: string
  maxDuration: number
  timeWarningAt: number
  silenceThreshold: number
  silenceDuration: number
  queueSize: number
  interviewType: string
}

export function LiveInterview({ job, resume, questions, interviewType = "first-interview" }: LiveInterviewProps) {
  const [interviewState, setInterviewState] = useState<"idle" | "starting" | "running" | "paused" | "ended">("idle")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [score, setScore] = useState(0)
  const [transcript, setTranscript] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(50)
  const [speechRate, setSpeechRate] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isTechnical, setIsTechnical] = useState(true)
  const [isShowingFeedback, setIsShowingFeedback] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Configure interview based on type
  const interviewConfig: ConversationalInterviewConfig = {
    voice: "Kore",
    maxDuration: interviewType === "phone-screener" ? 15 * 60 * 1000 : 30 * 60 * 1000, // 15 or 30 minutes
    timeWarningAt: interviewType === "phone-screener" ? 12 * 60 * 1000 : 27 * 60 * 1000, // 3 minutes before end
    silenceThreshold: 30,
    silenceDuration: 750,
    queueSize: 3,
    interviewType: interviewType,
  }

  const mutation = useMutation({
    mutationFn: startInterview,
    onSuccess: (data) => {
      console.log("Interview started:", data)
      setInterviewState("running")
      setIsLoading(false)
      setError(null)
      setCurrentQuestion(data.question)
      setTranscript((prev) => prev + " " + data.question)
      startTimer()
    },
    onError: (error: any) => {
      console.error("Failed to start interview:", error)
      setIsLoading(false)
      setError(error.message || "Failed to start interview")
      toast({
        title: "Uh oh! Something went wrong.",
        description: "There was an error starting the interview. Please try again.",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (elapsedTime >= interviewConfig.maxDuration) {
      endInterview()
    } else if (elapsedTime >= interviewConfig.timeWarningAt) {
      toast({
        title: "Time is running out!",
        description: "The interview will end soon.",
      })
    }
  }, [elapsedTime, interviewConfig.maxDuration, interviewConfig.timeWarningAt, toast])

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1000)
    }, 1000)
  }

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const resetTimer = () => {
    pauseTimer()
    setElapsedTime(0)
  }

  const handleStartInterview = async () => {
    setIsLoading(true)
    setInterviewState("starting")
    mutation.mutate({
      jobDescription: job.description,
      resumeText: resume?.text,
      technicalQuestions: questions.technical,
      behavioralQuestions: questions.behavioral,
      config: interviewConfig,
    })
  }

  const handlePauseResume = () => {
    if (interviewState === "running") {
      setInterviewState("paused")
      pauseTimer()
    } else if (interviewState === "paused") {
      setInterviewState("running")
      startTimer()
    }
  }

  const endInterview = () => {
    setInterviewState("ended")
    pauseTimer()
    toast({
      title: "Interview Ended",
      description: "The interview has ended. Redirecting to results page.",
    })
    setTimeout(() => {
      router.push("/interview-prep/results")
    }, 2000)
  }

  const handleNextQuestion = async () => {
    setIsLoading(true)
    // TODO: Implement the logic to fetch the next question from the backend
    setTimeout(() => {
      setIsLoading(false)
      const nextQuestion = "This is the next question."
      setCurrentQuestion(nextQuestion)
      setTranscript((prev) => prev + " " + nextQuestion)
    }, 1500)
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const handleSpeechRateChange = (value: number[]) => {
    setSpeechRate(value[0] / 100)
  }

  const toggleFeedback = () => {
    setIsShowingFeedback(!isShowingFeedback)
  }

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value)
  }

  const handleSubmitFeedback = () => {
    // TODO: Implement the logic to submit feedback to the backend
    toast({
      title: "Feedback Submitted",
      description: "Your feedback has been submitted.",
    })
    setIsShowingFeedback(false)
    setFeedback("")
  }

  const progress = (elapsedTime / interviewConfig.maxDuration) * 100
  const minutes = Math.floor(elapsedTime / 60000)
  const seconds = ((elapsedTime % 60000) / 1000).toFixed(0)

  return (
    <div className="flex flex-col h-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Live Interview</CardTitle>
          <CardDescription>
            {job?.title} at {job?.company}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <Badge variant="secondary">Status</Badge>
              </div>
              <div>
                {interviewState === "idle" && <Badge>Ready</Badge>}
                {interviewState === "starting" && <Badge variant="outline">Starting...</Badge>}
                {interviewState === "running" && <Badge variant="success">Running</Badge>}
                {interviewState === "paused" && <Badge variant="destructive">Paused</Badge>}
                {interviewState === "ended" && <Badge>Ended</Badge>}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Time Elapsed: {minutes}:{seconds.padStart(2, "0")}
            </div>
            {/* Add this in the status display section */}
            <div className="text-sm text-muted-foreground">
              Type: {interviewType === "phone-screener" ? "Phone Screener (15 min)" : "First Interview (30 min)"}
            </div>
            <div>
              <Progress value={progress} />
            </div>
            <div>
              <Label htmlFor="transcript">Transcript</Label>
              <Textarea id="transcript" value={transcript} readOnly className="h-24 resize-none" />
            </div>
            <div>
              <Label htmlFor="currentQuestion">Current Question</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input id="currentQuestion" value={currentQuestion || ""} readOnly />
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {interviewState === "idle" && (
            <Button onClick={handleStartInterview} disabled={isLoading}>
              {isLoading ? "Starting..." : "Start Interview"}
            </Button>
          )}
          {interviewState === "running" && (
            <Button onClick={handlePauseResume} variant="destructive">
              Pause
            </Button>
          )}
          {interviewState === "paused" && (
            <Button onClick={handlePauseResume} variant="secondary">
              Resume
            </Button>
          )}
          {(interviewState === "running" || interviewState === "paused") && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">End Interview</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The interview will be terminated and you will be redirected to the
                    results page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={endInterview}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
