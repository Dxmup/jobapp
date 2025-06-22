import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const resumeId = params.id

    if (!resumeId) {
      return NextResponse.json({ success: false, error: "Resume ID is required" }, { status: 400 })
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
      return NextResponse.json({ success: false, error: "Authentication error" }, { status: 401 })
    }

    if (!session) {
      console.error("No session found")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Get user ID from session
    const userId = session.user.id

    // Verify the resume belongs to the user
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, name, file_name")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single()

    if (resumeError) {
      console.error("Resume verification error:", resumeError)
      return NextResponse.json({ success: false, error: "Resume not found or access denied" }, { status: 403 })
    }

    // Get all user's jobs
    const { data: allJobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, company, location, status, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError)
      return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 })
    }

    // Get jobs already associated with this resume
    const { data: associatedJobs, error: associatedError } = await supabase
      .from("job_resumes")
      .select("job_id")
      .eq("resume_id", resumeId)

    if (associatedError) {
      console.error("Error fetching associated jobs:", associatedError)
      return NextResponse.json({ success: false, error: "Failed to fetch associated jobs" }, { status: 500 })
    }

    const associatedJobIds = new Set(associatedJobs?.map((jr) => jr.job_id) || [])

    // Format jobs with association status
    const formattedJobs = (allJobs || []).map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      status: job.status,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      isAssociated: associatedJobIds.has(job.id),
    }))

    // Separate available (not associated) and associated jobs
    const availableJobs = formattedJobs.filter((job) => !job.isAssociated)
    const currentlyAssociated = formattedJobs.filter((job) => job.isAssociated)

    return NextResponse.json({
      success: true,
      jobs: availableJobs, // Only return available jobs for association
      allJobs: formattedJobs, // All jobs with association status
      associatedJobs: currentlyAssociated, // Currently associated jobs
      resume: {
        id: resume.id,
        name: resume.name || resume.file_name || "Untitled Resume",
      },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
