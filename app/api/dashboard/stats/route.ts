import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get job statistics
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("status, created_at")
      .eq("user_id", userId)

    if (jobsError) {
      console.error("Error fetching jobs for stats:", jobsError)
      return NextResponse.json({ error: "Failed to fetch job statistics" }, { status: 500 })
    }

    // Get events for interviews
    const { data: events, error: eventsError } = await supabase
      .from("job_events")
      .select("event_type")
      .eq("user_id", userId)
      .in("event_type", ["interview", "interview_scheduled"])

    if (eventsError) {
      console.error("Error fetching events for stats:", eventsError)
    }

    const totalApplications = jobs?.length || 0
    const activeApplications =
      jobs?.filter((job) => ["applied", "interviewing", "offer"].includes(job.status?.toLowerCase())).length || 0

    const interviewsScheduled = events?.length || 0

    // Calculate response rate (simplified - interviews/applications)
    const responseRate = totalApplications > 0 ? Math.round((interviewsScheduled / totalApplications) * 100) : 0

    // Calculate weekly progress (jobs created this week)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklyProgress = jobs?.filter((job) => new Date(job.created_at) >= oneWeekAgo).length || 0

    const stats = {
      totalApplications,
      activeApplications,
      interviewsScheduled,
      responseRate,
      weeklyGoal: 5, // Default weekly goal
      weeklyProgress,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in dashboard stats API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
