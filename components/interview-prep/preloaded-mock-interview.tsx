"use client"

import { useState, useEffect } from "react"
import { LiveInterview } from "@/components/interview/live-interview"
import { getQuestionsForJob } from "@/lib/interview-prep"
import type { ConversationalInterviewConfig } from "@/lib/interview-prep/types"

interface PreloadedMockInterviewProps {
  job: any
  resume?: any
  shouldPreload: boolean
  interviewType: "phone-screener" | "first-interview"
}

export function PreloadedMockInterview({ job, resume, shouldPreload, interviewType }: PreloadedMockInterviewProps) {
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (shouldPreload) {
      loadQuestions()
    }
  }, [shouldPreload, job])

  const loadQuestions = async () => {
    setIsLoading(true)
    setLoadingProgress(0)
    setError(null)

    try {
      const loadedQuestions = await getQuestionsForJob(job, (progress) => {
        setLoadingProgress(progress)
      })
      setQuestions(loadedQuestions)
    } catch (err: any) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const interviewConfig: ConversationalInterviewConfig = {
    voice: "Kore",
    maxDuration: interviewType === "phone-screener" ? 15 * 60 * 1000 : 30 * 60 * 1000, // 15 or 30 minutes
    timeWarningAt: interviewType === "phone-screener" ? 12 * 60 * 1000 : 27 * 60 * 1000, // 3 minutes before end
    silenceThreshold: 30,
    silenceDuration: 750,
    queueSize: 3,
    interviewType: interviewType,
  }

  return (
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
  )
}
