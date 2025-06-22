import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Use the same authentication pattern as /jobs API
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      console.log("No user_id cookie found in dashboard stats API")
      return NextResponse.json({
        success: true,
        totalApplications: 0,
        activeApplications: 0,
        interviewsScheduled: 0,
        responseRate: 0,
        weeklyGoal: 5,
        weeklyProgress: 0,
      })
    }

    console.log("User ID from cookie in dashboard stats API:", userId)

    const supabase = createServerSupabaseClient()

    // Get jobs using the same pattern as /jobs API
    let { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, status, updated_at, applied_at, created_at")
      .eq("user_id", userId)

    // If no results or error, try with userId field
    if ((jobsError || !jobs || jobs.length === 0) && userId) {
      console.log("No jobs found with user_id field, trying userId field")
      const { data: altData, error: altError } = await supabase
        .from("jobs")
        .select("id, status, updated_at, applied_at, created_at")
        .eq("userId", userId)

      if (!altError && altData && altData.length > 0) {
        jobs = altData
        jobsError = null
      }
    }

    let totalApplications = 0
    let activeApplications = 0
    let interviewsScheduled = 0
    let weeklyProgress = 0

    if (!jobsError && jobs) {
      totalApplications = jobs.length

      // Count active applications (status is 'applied', 'interview', or 'offer')
      activeApplications = jobs.filter((job) => ["applied", "interview", "offer"].includes(job.status)).length

      interviewsScheduled = jobs.filter((job) => job.status === "interview").length

      // Calculate weekly progress (applications created this week)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      weeklyProgress = jobs.filter((job) => {
        const createdAt = new Date(job.created_at)
        return createdAt >= oneWeekAgo
      }).length
    } else if (jobsError) {
      console.error("Error fetching jobs for dashboard stats:", jobsError)
    }

    // Calculate response rate (simplified - interviews / total applications)
    const responseRate = totalApplications > 0 ? Math.round((interviewsScheduled / totalApplications) * 100) : 0

    const stats = {
      totalApplications,
      activeApplications,
      interviewsScheduled,
      responseRate,
      weeklyGoal: 5, // This could be made configurable per user
      weeklyProgress,
    }

    console.log("Dashboard stats API returning:", stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in dashboard stats API:", error)
    return NextResponse.json({
      totalApplications: 0,
      activeApplications: 0,
      interviewsScheduled: 0,
      responseRate: 0,
      weeklyGoal: 5,
      weeklyProgress: 0,
    })
  }
}
