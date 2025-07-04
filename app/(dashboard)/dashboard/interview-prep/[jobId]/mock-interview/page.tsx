import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getInterviewQuestions } from "@/app/actions/interview-prep-actions"
import { MockInterview } from "@/components/interview-prep/mock-interview"
import { cookies } from "next/headers"

interface MockInterviewPageProps {
  params: {
    jobId: string
  }
  searchParams: {
    resumeId?: string
  }
}

export default async function MockInterviewPage({ params, searchParams }: MockInterviewPageProps) {
  const { jobId } = params
  const { resumeId } = searchParams

  // Verify job exists and belongs to the user
  const supabase = createServerSupabaseClient()
  const { data: session } = await supabase.auth.getSession()

  // Get the user ID from session or cookie
  const userId = session?.user?.id
  const cookieStore = cookies()
  const cookieUserId = cookieStore.get("user_id")?.value
  const currentUserId = userId || cookieUserId

  // Get the job
  let job = null
  if (currentUserId) {
    const { data: jobData } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", currentUserId)
      .single()

    if (!jobData) {
      // Try with userId field
      const { data: altJobData } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .eq("userId", currentUserId)
        .single()
      job = altJobData
    } else {
      job = jobData
    }
  }

  if (!job) {
    return notFound()
  }

  // Get resume if specified
  let resume = null
  if (resumeId && currentUserId) {
    const { data: resumeData } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", currentUserId)
      .single()
    resume = resumeData
  }

  // Get interview questions
  const questionsResult = await getInterviewQuestions(jobId, resumeId)
  const questions = questionsResult.success ? questionsResult.questions : { technical: [], behavioral: [] }

  return (
    <div className="container py-6">
      <Suspense fallback={<div>Loading mock interview...</div>}>
        <MockInterview job={job} resume={resume} questions={questions} />
      </Suspense>
    </div>
  )
}
