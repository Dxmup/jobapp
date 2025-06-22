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
    const { data: jobs, error: jobsError } = await supabase.from("jobs").select("status").eq("user_id", userId)

    if (jobsError) {
      console.error("Error fetching jobs for stats:", jobsError)
      return NextResponse.json({ error: "Failed to fetch job statistics" }, { status: 500 })
    }

    const totalJobs = jobs?.length || 0
    const activeApplications =
      jobs?.filter((job) => ["applied", "interviewing", "offer"].includes(job.status?.toLowerCase())).length || 0

    const stats = {
      totalJobs,
      activeApplications,
      savedJobs: jobs?.filter((job) => job.status?.toLowerCase() === "saved").length || 0,
      appliedJobs: jobs?.filter((job) => job.status?.toLowerCase() === "applied").length || 0,
      interviewingJobs: jobs?.filter((job) => job.status?.toLowerCase() === "interviewing").length || 0,
      offerJobs: jobs?.filter((job) => job.status?.toLowerCase() === "offer").length || 0,
      rejectedJobs: jobs?.filter((job) => job.status?.toLowerCase() === "rejected").length || 0,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error in dashboard stats API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
