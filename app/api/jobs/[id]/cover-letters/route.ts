import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the job to verify it exists and belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 })
    }

    // Get all cover letters for this job
    const { data: coverLetters, error: coverLettersError } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("job_id", jobId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (coverLettersError) {
      console.error("Error fetching cover letters:", coverLettersError)
      return NextResponse.json({ error: "Failed to fetch cover letters" }, { status: 500 })
    }

    return NextResponse.json({ coverLetters })
  } catch (error) {
    console.error("Error in GET /api/jobs/[id]/cover-letters:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
