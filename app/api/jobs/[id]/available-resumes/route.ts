import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id

    if (!jobId) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 })
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

    // Verify the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, company")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError) {
      console.error("Job verification error:", jobError)
      return NextResponse.json({ success: false, error: "Job not found or access denied" }, { status: 403 })
    }

    // Get all user's resumes
    const { data: allResumes, error: resumesError } = await supabase
      .from("resumes")
      .select("id, name, file_name, created_at, updated_at, is_ai_generated, job_title, company")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
      return NextResponse.json({ success: false, error: "Failed to fetch resumes" }, { status: 500 })
    }

    // Get resumes already associated with this job
    const { data: associatedResumes, error: associatedError } = await supabase
      .from("job_resumes")
      .select("resume_id")
      .eq("job_id", jobId)

    if (associatedError) {
      console.error("Error fetching associated resumes:", associatedError)
      return NextResponse.json({ success: false, error: "Failed to fetch associated resumes" }, { status: 500 })
    }

    const associatedResumeIds = new Set(associatedResumes?.map((jr) => jr.resume_id) || [])

    // Format resumes with association status
    const formattedResumes = (allResumes || []).map((resume) => ({
      id: resume.id,
      name: resume.name || resume.file_name || "Untitled Resume",
      fileName: resume.file_name,
      createdAt: resume.created_at,
      updatedAt: resume.updated_at,
      isAiGenerated: resume.is_ai_generated || false,
      jobTitle: resume.job_title,
      company: resume.company,
      isAssociated: associatedResumeIds.has(resume.id),
      isForCurrentJob: associatedResumeIds.has(resume.id), // For backward compatibility
    }))

    // Separate available (not associated) and associated resumes
    const availableResumes = formattedResumes.filter((resume) => !resume.isAssociated)
    const currentlyAssociated = formattedResumes.filter((resume) => resume.isAssociated)

    return NextResponse.json({
      success: true,
      resumes: availableResumes, // Only return available resumes for import
      allResumes: formattedResumes, // All resumes with association status
      associatedResumes: currentlyAssociated, // Currently associated resumes
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
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
