"use client"

import { useMemo } from "react"
import { LiveInterview } from "@/components/interview/live-interview"
import type { ConversationalInterviewConfig } from "@/lib/interview/types"

interface PreloadedMockInterviewProps {
  job: any
  resume: any
  preloadedQuestions: any
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
  const interviewConfig: ConversationalInterviewConfig = useMemo(
    () => ({
      voice: "Kore",
      maxDuration: interviewType === "phone-screener" ? 15 * 60 * 1000 : 30 * 60 * 1000, // 15 or 30 minutes
      timeWarningAt: interviewType === "phone-screener" ? 10 * 60 * 1000 : 25 * 60 * 1000, // Warning at 10 or 25 minutes
      silenceThreshold: 20,
      silenceDuration: 1500,
      queueSize: 3,
      interviewType: interviewType, // Pass interviewType to the client config
    }),
    [interviewType], // Re-memoize if interviewType changes
  )

  if (!shouldPreload) {
    return null
  }

  return (
    <>
      <LiveInterview
        job={job}
        resume={resume}
        questions={preloadedQuestions}
        interviewConfig={interviewConfig}
        interviewType={interviewType} // Pass interviewType to LiveInterview
      />
    </>
  )
}
