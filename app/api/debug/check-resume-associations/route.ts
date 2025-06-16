import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerSupabaseClient()

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    let userId = null

    if (session && !sessionError) {
      userId = session.user.id
    } else {
      userId = cookieStore.get("user_id")?.value
      if (!userId) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }
    }

    // Get all resumes for the user
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
      return NextResponse.json({ error: "Failed to fetch resumes", details: resumesError.message }, { status: 500 })
    }

    // Get all job-resume associations for the user
    const { data: associations, error: associationsError } = await supabase
      .from("job_resumes")
      .select(`
        *,
        jobs:job_id (title, company),
        resumes:resume_id (name)
      `)
      .eq("user_id", userId)

    if (associationsError) {
      console.error("Error fetching associations:", associationsError)
      return NextResponse.json(
        { error: "Failed to fetch associations", details: associationsError.message },
        { status: 500 },
      )
    }

    // Get all jobs for the user
    const { data: jobs, error: jobsError } = await supabase.from("jobs").select("*").eq("user_id", userId)

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError)
      return NextResponse.json({ error: "Failed to fetch jobs", details: jobsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        resumeCount: resumes.length,
        resumes: resumes.map((r) => ({
          id: r.id,
          name: r.name,
          jobId: r.job_id,
          parentResumeId: r.parent_resume_id,
          isAiGenerated: r.is_ai_generated,
          versionName: r.version_name,
          createdAt: r.created_at,
        })),
        associationCount: associations.length,
        associations,
        jobCount: jobs.length,
        jobs: jobs.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
        })),
      },
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
