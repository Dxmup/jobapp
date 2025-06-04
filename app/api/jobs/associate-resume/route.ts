import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get user ID from cookie
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { resumeId, jobId } = body

    if (!resumeId || !jobId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log(`Associating resume ${resumeId} with job ${jobId}`)

    // Verify the resume belongs to the user
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single()

    if (resumeError || !resume) {
      console.error("Resume verification error:", resumeError)
      return NextResponse.json({ error: "Resume not found or access denied" }, { status: 403 })
    }

    // Verify the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError || !job) {
      console.error("Job verification error:", jobError)
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 403 })
    }

    // Check if the association already exists
    const { data: existingAssociation, error: existingAssociationError } = await supabase
      .from("job_resumes")
      .select("*")
      .eq("job_id", jobId)
      .eq("resume_id", resumeId)
      .single()

    if (!existingAssociationError && existingAssociation) {
      console.log("Association already exists")
      return NextResponse.json({
        success: true,
        message: "Resume already associated with this job",
        resumeId,
      })
    }

    // Create the association - don't include user_id yet
    const { data: association, error: associationError } = await supabase
      .from("job_resumes")
      .insert({
        job_id: jobId,
        resume_id: resumeId,
      })
      .select()
      .single()

    if (associationError) {
      console.error("Error creating association:", associationError)
      return NextResponse.json({ error: "Failed to associate resume with job" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Resume associated with job",
      resumeId,
    })
  } catch (error) {
    console.error("Error in associate resume API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
