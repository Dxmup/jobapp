import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "week"

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get job applications count
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError)
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    // Get resumes count
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("id, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
      return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
    }

    // Get cover letters count
    const { data: coverLetters, error: coverLettersError } = await supabase
      .from("cover_letters")
      .select("id, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())

    if (coverLettersError) {
      console.error("Error fetching cover letters:", coverLettersError)
      return NextResponse.json({ error: "Failed to fetch cover letters" }, { status: 500 })
    }

    // Get upcoming events (interviews)
    const { data: events, error: eventsError } = await supabase
      .from("job_events")
      .select("id, event_type, event_date")
      .eq("user_id", user.id)
      .eq("event_type", "interview")
      .gte("event_date", now.toISOString())

    if (eventsError) {
      console.error("Error fetching events:", eventsError)
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }

    // Calculate stats
    const applicationsSubmitted = jobs?.length || 0
    const interviewsScheduled = events?.length || 0

    // Calculate tasks completed (simplified logic)
    const resumesCreated = resumes?.length || 0
    const coverLettersCreated = coverLetters?.length || 0
    const jobsWithStatus = jobs?.filter((job) => job.status && job.status !== "draft").length || 0

    const tasksCompleted = resumesCreated + coverLettersCreated + jobsWithStatus
    const totalTasks = Math.max(tasksCompleted + 2, 5) // Always show at least 5 total tasks

    // Calculate overall progress
    const overallProgress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0

    return NextResponse.json({
      tasksCompleted,
      totalTasks,
      applicationsSubmitted,
      interviewsScheduled,
      overallProgress,
    })
  } catch (error) {
    console.error("Error in action plan overview:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
