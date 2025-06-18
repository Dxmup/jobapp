import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const serverSupabase = createServerSupabaseClient()

    // Verify that the user owns the resume
    const { data: resume, error: resumeError } = await serverSupabase
      .from("resumes")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ success: false, error: "Resume not found or access denied" }, { status: 404 })
    }

    // Get associated jobs through job_resumes table
    const { data: jobAssociations, error: associationsError } = await serverSupabase
      .from("job_resumes")
      .select(`
    job_id,
    jobs!inner (
      id,
      title,
      company,
      status,
      created_at,
      user_id
    )
  `)
      .eq("resume_id", params.id)

    if (associationsError) {
      console.error("Error fetching job associations:", associationsError)
      return NextResponse.json({ success: false, error: "Failed to fetch associated jobs" }, { status: 500 })
    }

    // Filter jobs to only include those owned by the current user
    const userJobs = jobAssociations
      .map((association) => association.jobs)
      .filter((job) => job !== null && job.user_id === userId)

    return NextResponse.json({ success: true, jobs: userJobs })
  } catch (error) {
    console.error("Error in associated-jobs route:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
