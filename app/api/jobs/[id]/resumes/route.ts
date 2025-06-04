import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    console.log("Fetching resumes for job:", jobId)

    // Create Supabase server client
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get user ID from cookie
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      console.log("No user ID found in cookies")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Using user ID:", userId)

    // Verify the job belongs to the user - FIXED: Don't use .single()
    const { data: jobs, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)

    if (jobError) {
      console.error("Job verification error:", jobError)
      return NextResponse.json({ error: "Error verifying job access" }, { status: 500 })
    }

    // Check if any jobs were found
    if (!jobs || jobs.length === 0) {
      console.log("No job found with ID", jobId, "for user", userId)
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 403 })
    }

    console.log("Job verification successful for job", jobId)

    // Get resume IDs associated with this job - don't filter by user_id
    const { data: jobResumes, error: jobResumesError } = await supabase
      .from("job_resumes")
      .select("resume_id")
      .eq("job_id", jobId)

    if (jobResumesError) {
      console.error("Error fetching job resumes:", jobResumesError)
      return NextResponse.json({ error: "Failed to fetch job resumes" }, { status: 500 })
    }

    console.log(`Found ${jobResumes?.length || 0} resume associations for job ${jobId}`)

    if (!jobResumes || jobResumes.length === 0) {
      // No resumes associated with this job
      return NextResponse.json({ resumes: [] })
    }

    // Get the resume IDs
    const resumeIds = jobResumes.map((jr) => jr.resume_id)

    // Get the resumes - make sure to filter by user_id here
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("*")
      .in("id", resumeIds)
      .eq("user_id", userId)

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
      return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
    }

    console.log(`Found ${resumes?.length || 0} resumes for job ${jobId}`)

    return NextResponse.json({ resumes: resumes || [] })
  } catch (error) {
    console.error("Error in job resumes API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const url = new URL(request.url)
    const resumeId = url.searchParams.get("resumeId")

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    console.log(`Removing resume ${resumeId} from job ${jobId}`)

    // Create Supabase server client
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get user ID from cookie
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the job belongs to the user - FIXED: Don't use .single()
    const { data: jobs, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)

    if (jobError) {
      console.error("Job verification error:", jobError)
      return NextResponse.json({ error: "Error verifying job access" }, { status: 500 })
    }

    // Check if any jobs were found
    if (!jobs || jobs.length === 0) {
      console.log("No job found with ID", jobId, "for user", userId)
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 403 })
    }

    // Verify the resume belongs to the user - FIXED: Don't use .single()
    const { data: resumes, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", userId)

    if (resumeError) {
      console.error("Resume verification error:", resumeError)
      return NextResponse.json({ error: "Error verifying resume access" }, { status: 500 })
    }

    // Check if any resumes were found
    if (!resumes || resumes.length === 0) {
      console.log("No resume found with ID", resumeId, "for user", userId)
      return NextResponse.json({ error: "Resume not found or access denied" }, { status: 403 })
    }

    // Delete the association - don't filter by user_id
    const { error: deleteError } = await supabase
      .from("job_resumes")
      .delete()
      .eq("job_id", jobId)
      .eq("resume_id", resumeId)

    if (deleteError) {
      console.error("Error deleting association:", deleteError)
      return NextResponse.json({ error: "Failed to remove resume from job" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Resume removed from job",
    })
  } catch (error) {
    console.error("Error in remove resume API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
