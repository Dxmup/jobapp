import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getInterviewQuestions } from "@/app/actions/interview-prep-actions"
import { SimpleMockInterview } from "@/components/interview-prep/simple-mock-interview"
import { Loader2 } from "lucide-react"
import { cookies } from "next/headers"
import { TTSTest } from "@/components/interview-prep/tts-test"

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
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mock Phone Interview</h1>
        <p className="text-muted-foreground">
          Practice your interview skills with AI-generated voice questions for {job.title} at {job.company}
        </p>
      </div>

      <div className="mb-6">
        <TTSTest />
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading interview...
          </div>
        }
      >
        <SimpleMockInterview job={job} resume={resume} questions={questions} />
      </Suspense>
    </div>
  )
}
