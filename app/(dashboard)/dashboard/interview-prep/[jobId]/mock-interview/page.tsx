import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

import { PreloadedMockInterview } from "@/components/interview-prep/preloaded-mock-interview"

interface MockInterviewPageProps {
  params: {
    jobId: string
  }
  searchParams: {
    resumeId?: string
    preload?: string
  }
}

// SIMPLIFIED: Function to get user's first name from user_profiles table
async function getUserFirstName(userId: string): Promise<string> {
  try {
    const supabase = createServerSupabaseClient()

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("user_first_name")
      .eq("user_id", userId)
      .single()

    if (!error && profile?.user_first_name) {
      console.log(`Found user first name: ${profile.user_first_name}`)
      return profile.user_first_name
    }

    console.log("No user_first_name found in user_profiles")
    return "the candidate"
  } catch (error) {
    console.error("Error fetching user first name:", error)
    return "the candidate"
  }
}

export default async function MockInterviewPage({ params, searchParams }: MockInterviewPageProps) {
  const { jobId } = params
  const { resumeId, preload } = searchParams
  const isPreloaded = preload === "true"

  // Verify job exists and belongs to the user
  const supabase = createServerSupabaseClient()
  const { data: session } = await supabase.auth.getSession()

  // Get the user ID from session or cookie
  const userId = session?.user?.id
  const cookieStore = cookies()
  const cookieUserId = cookieStore.get("user_id")?.value

  // Use session user ID first, then fall back to cookie
  const currentUserId = userId || cookieUserId

  // SIMPLIFIED: Get user's first name from user_profiles table only
  let userFirstName = "the candidate"
  if (currentUserId) {
    userFirstName = await getUserFirstName(currentUserId)
  }

  console.log(`👤 User first name for mock interview: ${userFirstName}`)
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

  // Get resume if resumeId is provided
  let resume = null
  if (resumeId && currentUserId) {
    // Try with user_id field first
    const { data: resumeData, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", currentUserId)
      .single()

    if (!resumeError && resumeData) {
      resume = resumeData
    } else {
      // Try with userId field
      const { data: altResumeData, error: altResumeError } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .eq("userId", currentUserId)
        .single()

      if (!altResumeError && altResumeData) {
        resume = altResumeData
      }
    }
  }

  // SIMPLIFIED: Always start with empty questions - they will be generated on demand
  const initialQuestions = { technical: [], behavioral: [] }
  console.log(`Starting with empty questions - will generate on demand`)

  return (
    <div className="container py-6">
      <Suspense fallback={<div>Loading mock interview...</div>}>
        <PreloadedMockInterview
          job={job}
          resume={resume}
          questions={initialQuestions}
          isPreloaded={isPreloaded}
          userFirstName={userFirstName}
        />
      </Suspense>
    </div>
  )
}
