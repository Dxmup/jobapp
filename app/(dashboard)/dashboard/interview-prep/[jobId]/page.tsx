import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { JobInterviewHeader } from "@/components/interview-prep/job-interview-header"
import { JobInterviewQuestions } from "@/components/interview-prep/job-interview-questions"
import { GeneralInterviewTips } from "@/components/interview-prep/general-interview-tips"
import { InterviewQuestionsLoading } from "@/components/interview-prep/interview-questions-loading"
import { getInterviewQuestions } from "@/app/actions/interview-prep-actions"
import { DebugPanel, ErrorAlert } from "@/components/debug/debug-panel"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { cookies } from "next/headers"
import { debugJobAccess } from "@/lib/debug-utils"

interface JobInterviewPrepPageProps {
  params: {
    jobId: string
  }
  searchParams: {
    resumeId?: string
    debug?: string
    interviewType?: "phone-screener" | "first-interview"
  }
}

export default async function JobInterviewPrepPage({ params, searchParams }: JobInterviewPrepPageProps) {
  const { jobId } = params
  const { resumeId, debug, interviewType = "first-interview" } = searchParams
  const showDebug = debug === "true"

  // Get debug information if debug mode is enabled
  const debugInfo = showDebug ? await debugJobAccess(jobId) : null

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
  let jobError = null

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
      } else {
        jobError = error2 || error1
        console.log(`Job lookup failed:`, jobError)
      }
    }
  } else {
    console.log("No user ID available")
    jobError = { message: "No user ID available" }
  }

  // If we couldn't find the job with user filtering, try without filtering (for debugging)
  let directJob = null
  if (!job && showDebug) {
    const { data: directJobData } = await supabase.from("jobs").select("*").eq("id", jobId).single()
    directJob = directJobData
    console.log(`Direct job lookup (debug):`, directJob ? `Found ${directJobData.title}` : "Not found")
  }

  // If job not found and not in debug mode, show not found page
  if (!job && !showDebug) {
    console.log(`Job not found, redirecting to not found page`)
    return notFound()
  }

  // Prefetch interview questions if we have a job
  let initialQuestions = { technical: [], behavioral: [] }
  let questionsError = null

  if (job) {
    const questionsResult = await getInterviewQuestions(jobId, resumeId)
    if (questionsResult.success && questionsResult.questions) {
      initialQuestions = questionsResult.questions
    } else {
      questionsError = questionsResult.error
    }
  }

  // Build the mock interview URL with job ID and resume ID
  const mockInterviewUrl = resumeId
    ? `/dashboard/interview-prep/${jobId}/mock-interview?resumeId=${resumeId}&preload=true&interviewType=${interviewType}`
    : `/dashboard/interview-prep/${jobId}/mock-interview?preload=true&interviewType=${interviewType}`

  return (
    <div className="container py-6 space-y-8">
      {showDebug && debugInfo && (
        <DebugPanel title="Job Access Debug Information" data={debugInfo.debugInfo} showInitially={true} />
      )}

      {!job && showDebug && (
        <ErrorAlert
          message="Job Not Found (Debug Mode)"
          details={`The job with ID ${jobId} was not found for the current user (${currentUserId || "unknown"}). 
          ${directJob ? "However, the job does exist in the database but belongs to a different user." : "The job does not exist in the database."}`}
        />
      )}

      {job ? (
        <>
          <JobInterviewHeader job={job} resumeId={resumeId} />

          {/* Mock Interview Button */}
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-purple-800">Practice Mock Phone Interviews</h3>
                <p className="text-purple-700">
                  Simulate a real {interviewType === "phone-screener" ? "phone screening" : "first interview"} with our
                  AI interviewer based on this job description
                  {resumeId ? " and your resume" : ""}.
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  ✨ Questions will be pre-loaded for faster interview start
                </p>
              </div>
              <Link href={mockInterviewUrl}>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Phone className="mr-2 h-4 w-4" />
                  Try Mock Phone Interview
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Live AI Interview Button - Temporarily hidden */}
          {/* 
<Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
  <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
    <div className="mb-4 md:mb-0">
      <h3 className="text-xl font-bold text-emerald-800">🎙️ Live AI Interview (Beta)</h3>
      <p className="text-emerald-700">
        Experience a real-time conversation with an AI interviewer. This is the most realistic interview
        practice available.
      </p>
    </div>
    <div className="flex-shrink-0">
      <LiveInterview job={job} resume={resumeId} questions={initialQuestions} />
    </div>
  </CardContent>
</Card>
*/}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Suspense fallback={<InterviewQuestionsLoading />}>
                <JobInterviewQuestions
                  jobId={jobId}
                  initialQuestions={initialQuestions}
                  resumeId={resumeId}
                  initialError={questionsError}
                />
              </Suspense>
            </div>

            <div>
              <GeneralInterviewTips />
            </div>
          </div>
        </>
      ) : !showDebug ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">
            The job you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <p className="text-sm text-gray-500">Try adding ?debug=true to the URL for more information.</p>
        </div>
      ) : null}
    </div>
  )
}
