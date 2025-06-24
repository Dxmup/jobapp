import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { PreloadedMockInterview } from "@/components/interview-prep/preloaded-mock-interview"
import { getInterviewQuestions } from "@/app/actions/interview-prep-actions"
import { cookies } from "next/headers"
import { getUserProfile } from "@/app/actions/user-actions"

interface MockInterviewPageProps {
  params: {
    jobId: string
  }
  searchParams: {
    resumeId?: string
    preload?: string
  }
}

export default async function MockInterviewPage({ params, searchParams }: MockInterviewPageProps) {
  const { jobId } = params
  const { resumeId, preload } = searchParams
  const isPreloaded = preload === "true"

  // Get user information
  const supabase = createServerSupabaseClient()
  const { data: session } = await supabase.auth.getSession()

  const userId = session?.user?.id
  const cookieStore = cookies()
  const cookieUserId = cookieStore.get("user_id")?.value
  const currentUserId = userId || cookieUserId

  // Get user's first name from profile
  let userFirstName = "the candidate"
  let userName = "the candidate"

  if (currentUserId) {
    console.log(`🔍 Getting user profile for mock interview: ${currentUserId}`)

    const profileResult = await getUserProfile(currentUserId)
    console.log(`👤 Profile result for mock interview:`, profileResult)

    if (profileResult.success && profileResult.profile) {
      const profile = profileResult.profile

      // Extract first name from various possible fields
      userFirstName =
        profile.user_first_name || profile.first_name || profile.full_name?.split(" ")[0] || "the candidate"

      // Extract full name for display
      userName =
        profile.full_name ||
        `${profile.user_first_name || profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
        userFirstName

      console.log(`✅ Mock interview - extracted first name: "${userFirstName}"`)
      console.log(`✅ Mock interview - extracted full name: "${userName}"`)
    } else {
      console.log(`❌ Mock interview - failed to get profile:`, profileResult.error)
    }
  }

  // If we still have session, try to get name from there
  if (userFirstName === "the candidate" && session?.user) {
    userName =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.email?.split("@")[0] ||
      "the candidate"

    userFirstName = userName.split(" ")[0] || "the candidate"
    console.log(`📧 Mock interview - using session name: "${userName}", first: "${userFirstName}"`)
  }

  // Verify job exists and belongs to the user
  console.log(`🔍 Looking for job ${jobId} for user ${currentUserId}`)

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
      console.log(`✅ Found job with user_id: ${jobData.title}`)
    } else {
      // Try with userId field
      const { data: altJobData, error: error2 } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .eq("userId", currentUserId)
        .single()

      if (!error2 && altJobData) {
        job = altJobData
        console.log(`✅ Found job with userId: ${altJobData.title}`)
      } else {
        console.log(`❌ Job lookup failed:`, error2 || error1)
      }
    }
  }

  if (!job) {
    console.log(`❌ Job not found, redirecting to not found page`)
    return notFound()
  }

  // Get interview questions
  let initialQuestions = { technical: [], behavioral: [] }
  let questionsError = null

  if (isPreloaded) {
    console.log(`🔄 Preloading interview questions for job ${jobId}`)
    const questionsResult = await getInterviewQuestions(jobId, resumeId)
    if (questionsResult.success && questionsResult.questions) {
      initialQuestions = questionsResult.questions
      console.log(`✅ Preloaded ${initialQuestions.technical.length + initialQuestions.behavioral.length} questions`)
    } else {
      questionsError = questionsResult.error
      console.log(`❌ Failed to preload questions:`, questionsError)
    }
  }

  console.log(`🎭 Mock interview page - passing props:`, {
    jobTitle: job.title,
    userFirstName,
    userName,
    isPreloaded,
    questionsCount: initialQuestions.technical.length + initialQuestions.behavioral.length,
  })

  return (
    <div className="container py-6">
      <Suspense fallback={<div>Loading interview...</div>}>
        <PreloadedMockInterview
          job={job}
          resume={resumeId}
          questions={initialQuestions}
          questionsError={questionsError}
          isPreloaded={isPreloaded}
          userFirstName={userFirstName}
          userName={userName}
        />
      </Suspense>
    </div>
  )
}
