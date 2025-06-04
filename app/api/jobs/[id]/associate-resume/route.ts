import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Parse the request body to get the resumeId
    const { resumeId } = await request.json()

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    // Create Supabase server client
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error", details: sessionError.message }, { status: 401 })
    }

    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user ID from session
    const userId = session.user.id

    // Verify the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError) {
      console.error("Job verification error:", jobError)
      return NextResponse.json({ error: "Job not found or access denied", details: jobError.message }, { status: 403 })
    }

    // Verify the resume belongs to the user
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, name")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single()

    if (resumeError) {
      console.error("Resume verification error:", resumeError)
      return NextResponse.json(
        { error: "Resume not found or access denied", details: resumeError.message },
        { status: 403 },
      )
    }

    // Check if we have a job_resumes table
    // If not, we'll create it
    const { error: tableCheckError } = await supabase.from("job_resumes").select("id").limit(1)

    if (tableCheckError) {
      // Table doesn't exist, create it
      const { error: createTableError } = await supabase.rpc("create_job_resumes_table")

      if (createTableError) {
        console.error("Error creating job_resumes table:", createTableError)
        return NextResponse.json(
          { error: "Failed to create job_resumes table", details: createTableError.message },
          { status: 500 },
        )
      }
    }

    // Check if the association already exists
    const { data: existingAssoc, error: existingAssocError } = await supabase
      .from("job_resumes")
      .select("id")
      .eq("job_id", jobId)
      .eq("resume_id", resumeId)
      .single()

    if (!existingAssocError && existingAssoc) {
      // Association already exists, return success
      return NextResponse.json({
        success: true,
        message: "Resume already associated with this job",
        resumeName: resume.name,
      })
    }

    // Create the association
    const { error: insertError } = await supabase.from("job_resumes").insert({
      job_id: jobId,
      resume_id: resumeId,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error associating resume with job:", insertError)
      return NextResponse.json(
        { error: "Failed to associate resume with job", details: insertError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Resume associated with job successfully",
      resumeName: resume.name,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Handle DELETE request to remove a resume association
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const { resumeId } = await request.json()

    if (!jobId || !resumeId) {
      return NextResponse.json({ error: "Job ID and Resume ID are required" }, { status: 400 })
    }

    // Create Supabase server client
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error", details: sessionError.message }, { status: 401 })
    }

    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user ID from session
    const userId = session.user.id

    // Verify the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError) {
      console.error("Job verification error:", jobError)
      return NextResponse.json({ error: "Job not found or access denied", details: jobError.message }, { status: 403 })
    }

    // Delete the association
    const { error: deleteError } = await supabase
      .from("job_resumes")
      .delete()
      .eq("job_id", jobId)
      .eq("resume_id", resumeId)

    if (deleteError) {
      console.error("Error removing resume association:", deleteError)
      return NextResponse.json(
        { error: "Failed to remove resume association", details: deleteError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Resume association removed successfully",
    })
  } catch (error) {
    console.error("Error removing resume association:", error)
    return NextResponse.json(
      {
        error: "Failed to remove resume association",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
