import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Create Supabase client
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get user ID from URL parameter
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Query all resumes for this user
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user resumes:", error)
      return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
    }

    // Query all job_resumes entries for this user
    const { data: jobResumes, error: jobResumesError } = await supabase
      .from("job_resumes")
      .select("*")
      .eq("user_id", userId)

    if (jobResumesError) {
      console.error("Error fetching job_resumes:", jobResumesError)
    }

    // Get all jobs for this user
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, company")
      .eq("user_id", userId)

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError)
    }

    return NextResponse.json({
      userId,
      resumeCount: resumes?.length || 0,
      resumes: resumes || [],
      jobResumeCount: jobResumes?.length || 0,
      jobResumes: jobResumes || [],
      jobCount: jobs?.length || 0,
      jobs: jobs || [],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in user-resumes diagnostic API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
