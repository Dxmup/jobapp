"use client"

import { useState, useEffect, useRef } from "react"
import {
  ConversationalInterviewClient,
  type ConversationalInterviewConfig,
} from "@/lib/conversational-interview-client"

interface LiveInterviewProps {
  job: any
  resume: any
  questions: any
  interviewConfig: ConversationalInterviewConfig
  interviewType: "phone-screener" | "first-interview"
}

export function LiveInterview({ job, resume, questions, interviewConfig, interviewType }: LiveInterviewProps) {
  const [isClientReady, setIsClientReady] = useState(false)
  const interviewClientRef = useRef<ConversationalInterviewClient | null>(null)

  useEffect(() => {
    const shouldPreload = interviewConfig.preload ?? false

    const callbacks = {
      onComplete: () => {
        // Handle interview completion
        console.log("Interview completed!")
      },
      onError: (error: any) => {
        // Handle errors
        console.error("Interview error:", error)
      },
    }

    ConversationalInterviewClient.create(job.id, resume?.id, questions, job, resume, interviewConfig, callbacks).then(
      (client) => {
        interviewClientRef.current = client
        setIsClientReady(true)
        if (shouldPreload) {
          // If preloaded, start immediately
          client.startInterview()
        }
      },
    )

    return () => {
      // Cleanup when the component unmounts
      interviewClientRef.current?.destroy()
    }
  }, [job.id, resume?.id, questions, job, resume, interviewConfig])

  return <div>{isClientReady ? <div>Interview is ready.</div> : <div>Loading interview...</div>}</div>
}
