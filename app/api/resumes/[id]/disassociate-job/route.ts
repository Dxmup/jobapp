import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 })
    }

    const serverSupabase = createServerSupabaseClient()

    // Verify that the user owns the resume
    const { data: resume, error: resumeError } = await serverSupabase
      .from("resumes")
      .select("id, user_id")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ success: false, error: "Resume not found or access denied" }, { status: 404 })
    }

    // Verify that the user owns the job
    const { data: job, error: jobError } = await serverSupabase
      .from("jobs")
      .select("id, user_id")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ success: false, error: "Job not found or access denied" }, { status: 404 })
    }

    // Check if the job_resumes table has a user_id column
    const { data: tableInfo } = await serverSupabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "job_resumes")
      .eq("column_name", "user_id")

    const hasUserIdColumn = tableInfo && tableInfo.length > 0

    // Delete the association
    let query = serverSupabase.from("job_resumes").delete().eq("job_id", jobId).eq("resume_id", params.id)

    // Add user_id filter if the column exists
    if (hasUserIdColumn) {
      query = query.eq("user_id", userId)
    }

    const { error: deleteError } = await query

    if (deleteError) {
      console.error("Error removing job-resume association:", deleteError)
      return NextResponse.json({ success: false, error: "Failed to remove job association" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Job association removed successfully" })
  } catch (error) {
    console.error("Error in disassociate-job route:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
