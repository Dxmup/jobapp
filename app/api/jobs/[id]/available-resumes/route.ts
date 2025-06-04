import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * This endpoint retrieves all resumes available for customization for a specific job.
 * It returns all resumes belonging to the current user, with metadata about whether
 * they are baseline resumes or job-specific resumes.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id

    // Create Supabase client
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get user ID from cookie
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Replace the job query section with this improved version that handles errors better

    // Verify the job belongs to the user
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, company, description")
      .eq("id", jobId)
      .eq("user_id", userId)

    // Handle job not found more gracefully
    let job = null
    if (jobError) {
      console.error("Error fetching job:", jobError)
      // Continue without job data instead of returning an error
    } else if (jobData && jobData.length > 0) {
      job = jobData[0] // Take the first job if multiple are returned
    }

    // Simple query to get ALL resumes for this user
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
      return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
    }

    // Process resumes to add metadata
    const processedResumes = resumes.map((resume) => ({
      id: resume.id,
      name: resume.name,
      isBaseline: resume.job_id === null,
      jobId: resume.job_id,
      jobTitle: resume.job_title,
      company: resume.company,
      createdAt: resume.created_at,
      updatedAt: resume.updated_at,
      isForCurrentJob: resume.job_id === jobId,
      isAiGenerated: resume.is_ai_generated,
    }))

    return NextResponse.json({
      success: true,
      job,
      resumes: processedResumes,
    })
  } catch (error) {
    console.error("Error in available-resumes API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
