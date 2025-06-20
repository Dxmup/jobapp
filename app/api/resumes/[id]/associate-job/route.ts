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

    // Verify that the user owns both the resume and the job
    const { data: resume, error: resumeError } = await serverSupabase
      .from("resumes")
      .select("id, user_id")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ success: false, error: "Resume not found or access denied" }, { status: 404 })
    }

    const { data: job, error: jobError } = await serverSupabase
      .from("jobs")
      .select("id, user_id")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ success: false, error: "Job not found or access denied" }, { status: 404 })
    }

    // Check if association already exists
    const { data: existingAssociation } = await serverSupabase
      .from("job_resumes")
      .select("id")
      .eq("job_id", jobId)
      .eq("resume_id", params.id)
      .single()

    if (existingAssociation) {
      return NextResponse.json({ success: false, error: "Resume is already associated with this job" }, { status: 400 })
    }

    // First, check if the job_resumes table has a user_id column
    const { data: tableInfo, error: tableInfoError } = await serverSupabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "job_resumes")
      .eq("column_name", "user_id")

    const hasUserIdColumn = tableInfo && tableInfo.length > 0

    // Create the association with or without user_id based on schema
    const insertData: any = {
      job_id: jobId,
      resume_id: params.id,
      created_at: new Date().toISOString(),
    }

    // Only add user_id if the column exists
    if (hasUserIdColumn) {
      insertData.user_id = userId
    }

    const { error: insertError } = await serverSupabase.from("job_resumes").insert(insertData)

    if (insertError) {
      console.error("Error creating job-resume association:", insertError)
      return NextResponse.json({ success: false, error: "Failed to associate resume with job" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Resume successfully associated with job" })
  } catch (error) {
    console.error("Error in associate-job route:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
