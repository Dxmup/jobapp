import { ConversationalInterviewClient } from "./conversational-interview-client"

interface PreloadedMockInterviewProps {
  job: any
  resume: any | null
  preloadedQuestions: any | null
  shouldPreload: boolean
  interviewType?: "phone-screener" | "first-interview"
}

export function PreloadedMockInterview({
  job,
  resume,
  preloadedQuestions,
  shouldPreload,
  interviewType = "first-interview",
}: PreloadedMockInterviewProps) {
  return (
    <ConversationalInterviewClient
      job={job}
      resume={resume}
      preloadedQuestions={preloadedQuestions}
      shouldPreload={shouldPreload}
      interviewType={interviewType}
    />
  )
}
