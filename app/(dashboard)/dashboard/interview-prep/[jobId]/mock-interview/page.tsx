import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getInterviewQuestions } from "@/app/actions/interview-prep-actions"
import { cookies } from "next/headers"
import { PreloadedMockInterview } from "@/components/interview-prep/preloaded-mock-interview"

interface MockInterviewPageProps {
  params: {
    jobId: string
  }
  searchParams: {
    resumeId?: string
    preload?: string
    interviewType?: "phone-screener" | "first-interview"
  }
}

export default async function MockInterviewPage({ params, searchParams }: MockInterviewPageProps) {
  const { jobId } = params
  const { resumeId, preload, interviewType } = searchParams
  const shouldPreload = preload === "true"

  // Verify job exists and belongs to the user
  const supabase = createServerSupabaseClient()
  const { data: session } = await supabase.auth.getSession()

  // Get the user ID from session or cookie
  const userId = session?.user?.id
  const cookieStore = cookies()
  const cookieUserId = cookieStore.get("user_id")?.value

  // Use session user ID first, then fall back to cookie
  const currentUserId = userId || cookieUserId

  console.log(`Looking for job ${jobId} for user ${currentUserId}`)

  // Try to get the job with both user_id and userId fields
  let job = null

  if (currentUserId) {
    // Try with user_id field first
    const { data: jobData, error: error1 } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", currentUserId)
      .single()

    if (!error1 && jobData) {
      job = jobData
      console.log(`Found job with user_id: ${jobData.title}`)
    } else {
      console.log(`No job found with user_id, trying userId field`)
      // Try with userId field
      const { data: altJobData, error: error2 } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .eq("userId", currentUserId)
        .single()

      if (!error2 && altJobData) {
        job = altJobData
        console.log(`Found job with userId: ${altJobData.title}`)
      }
    }
  }

  if (!job) {
    console.log(`Job not found, redirecting to not found page`)
    return notFound()
  }

  // Get resume data if resumeId is provided
  let resume = null
  if (resumeId && currentUserId) {
    const { data: resumeData } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", currentUserId)
      .single()

    if (resumeData) {
      resume = resumeData
      console.log(`Found resume: ${resumeData.name}`)
    }
  }

  // Preload interview questions if requested
  let preloadedQuestions = null
  if (shouldPreload) {
    console.log("🚀 Preloading interview questions...")
    const questionsResult = await getInterviewQuestions(jobId, resumeId)
    if (questionsResult.success && questionsResult.questions) {
      preloadedQuestions = questionsResult.questions
      console.log(
        `✅ Preloaded ${preloadedQuestions.technical.length} technical + ${preloadedQuestions.behavioral.length} behavioral questions`,
      )
    } else {
      console.warn("⚠️ Failed to preload questions:", questionsResult.error)
    }
  }

  return (
    <div className="container py-6">
      <Suspense fallback={<div>Loading mock interview...</div>}>
        <PreloadedMockInterview
          job={job}
          resume={resume}
          preloadedQuestions={preloadedQuestions}
          shouldPreload={shouldPreload}
          interviewType={interviewType || "first-interview"}
        />
      </Suspense>
    </div>
  )
}
