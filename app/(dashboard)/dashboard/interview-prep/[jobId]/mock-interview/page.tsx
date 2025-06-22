import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { PreloadedMockInterview } from "@/components/interview-prep/preloaded-mock-interview"

interface Props {
  params: {
    jobId: string
  }
}

const MockInterviewPage = async ({ params: { jobId } }: Props) => {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/sign-in")
  }

  const currentUserId = session?.user?.id

  const { data: job, error: jobError } = await supabase.from("jobs").select("*").eq("id", jobId).single()

  if (jobError) {
    console.error("Error fetching job:", jobError)
    return <div>Error fetching job</div>
  }

  const { data: resume, error: resumeError } = await supabase.from("resumes").select("*").eq("job_id", jobId).single()

  if (resumeError) {
    console.error("Error fetching resume:", resumeError)
    return <div>Error fetching resume</div>
  }

  const { data: questions, error: questionsError } = await supabase.from("questions").select("*").eq("job_id", jobId)

  if (questionsError) {
    console.error("Error fetching questions:", questionsError)
    return <div>Error fetching questions</div>
  }

  // Get the user's actual name from session or profile
  let userName = "the candidate"
  if (session?.user) {
    // Try to get name from user metadata first
    userName =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.email?.split("@")[0] ||
      "the candidate"
  }

  // If we still don't have a good name, try to get it from user profile
  if (userName === "the candidate" && currentUserId) {
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("full_name, first_name, last_name")
      .eq("user_id", currentUserId)
      .single()

    if (userProfile) {
      userName =
        userProfile.full_name || `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim() || userName
    }
  }

  console.log(`👤 User name for mock interview: ${userName}`)

  return (
    <PreloadedMockInterview
      job={job}
      resume={resume}
      preloadedQuestions={
        questions
          ? {
              technical: questions.filter((q) => q.type === "technical").map((q) => q.question),
              behavioral: questions.filter((q) => q.type === "behavioral").map((q) => q.question),
            }
          : null
      }
      shouldPreload={true}
      interviewType="first-interview"
    />
  )
}

export default MockInterviewPage
