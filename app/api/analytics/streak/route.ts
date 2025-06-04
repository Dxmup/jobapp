import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get all jobs for this user with their status and updated_at timestamp
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("status, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching jobs for streak calculation:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 })
    }

    // Filter to only include jobs that were updated to "applied" status
    const appliedJobs = jobs.filter((job) => job.status === "applied")

    if (appliedJobs.length === 0) {
      return NextResponse.json({ success: true, streak: 0 })
    }

    // Get unique dates (in YYYY-MM-DD format) when jobs were updated to "applied"
    const applicationDates = appliedJobs
      .map((job) => {
        const date = new Date(job.updated_at)
        return date.toISOString().split("T")[0] // Get YYYY-MM-DD format
      })
      .filter((date, index, self) => self.indexOf(date) === index) // Get unique dates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort descending

    // Check if there's an application today
    const today = new Date()
    const todayString = today.toISOString().split("T")[0]

    // Calculate streak
    let streak = 0
    const currentDate = new Date(today)

    // Check if there's an application today, if not start from yesterday
    if (!applicationDates.includes(todayString)) {
      currentDate.setDate(currentDate.getDate() - 1)
    }

    // Check consecutive days
    while (true) {
      const dateString = currentDate.toISOString().split("T")[0]

      if (applicationDates.includes(dateString)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return NextResponse.json({ success: true, streak })
  } catch (error) {
    console.error("Error calculating application streak:", error)
    return NextResponse.json({ success: false, error: "Failed to calculate streak" }, { status: 500 })
  }
}
