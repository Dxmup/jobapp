import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserIdentity } from "@/lib/user-identity"

export async function GET() {
  try {
    const user = await getUserIdentity()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const userId = user.id

    // Get one week ago date
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const oneWeekAgoStr = oneWeekAgo.toISOString()

    // Get applications this week
    const { data: weeklyApplications, error: weeklyError } = await supabase
      .from("jobs")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", oneWeekAgoStr)

    if (weeklyError) {
      console.error("Error fetching weekly applications:", weeklyError)
    }

    // Get total applications
    const { data: totalApplications, error: totalError } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("user_id", userId)

    if (totalError) {
      console.error("Error fetching total applications:", totalError)
    }

    // Calculate stats
    let responseRate = "0%"
    let interviewConversion = "0%"
    const applicationsThisWeek = weeklyApplications?.length || 0

    if (totalApplications && totalApplications.length > 0) {
      // Response rate: (interviews + offers + rejections) / total applications
      const responses = totalApplications.filter((job) =>
        ["interview", "offer", "rejected"].includes(job.status),
      ).length

      responseRate = `${Math.round((responses / totalApplications.length) * 100)}%`

      // Interview conversion: (interviews + offers) / total applications
      const interviews = totalApplications.filter((job) => ["interview", "offer"].includes(job.status)).length

      interviewConversion = `${Math.round((interviews / totalApplications.length) * 100)}%`
    }

    return NextResponse.json({
      stats: {
        responseRate,
        interviewConversion,
        applicationsThisWeek,
      },
    })
  } catch (error) {
    console.error("Error in quick stats API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
