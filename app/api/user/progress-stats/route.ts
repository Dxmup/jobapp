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

    // Get all applications
    const { data: applications, error: applicationsError } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("user_id", userId)

    if (applicationsError) {
      console.error("Error fetching applications:", applicationsError)
      return NextResponse.json({ error: "Failed to fetch progress stats" }, { status: 500 })
    }

    // Calculate stats
    const applicationsSubmitted = applications?.length || 0

    // Target is either 20 or 5 more than current count, whichever is higher
    const applicationsTarget = Math.max(20, applicationsSubmitted + 5)

    // Count responses (interviews, offers, rejections)
    const responsesReceived =
      applications?.filter((app) => ["interview", "interviewing", "offer", "rejected"].includes(app.status)).length || 0

    // Count interviews completed
    const interviewsCompleted =
      applications?.filter((app) => ["interview", "interviewing", "offer"].includes(app.status)).length || 0

    return NextResponse.json({
      stats: {
        applicationsSubmitted,
        applicationsTarget,
        responsesReceived,
        interviewsCompleted,
      },
    })
  } catch (error) {
    console.error("Error in progress stats API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
