import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserIdentity } from "@/lib/user-identity"
import { format } from "date-fns"

export async function GET() {
  try {
    const user = await getUserIdentity()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const userId = user.id

    // Fetch recent job applications
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, company, status, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5)

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError)
      return NextResponse.json({ error: "Failed to fetch recent applications" }, { status: 500 })
    }

    // Format the applications for display
    const applications =
      jobs?.map((job) => {
        const createdAt = new Date(job.created_at)
        const updatedAt = new Date(job.updated_at)

        // Determine if there was a response
        const hasResponse = ["interview", "interviewing", "offer", "rejected"].includes(job.status)

        // Calculate response time if there was a response
        let responseTime = "-"
        if (hasResponse) {
          const diffInDays = Math.floor((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
          responseTime = diffInDays <= 0 ? "Same day" : `${diffInDays} day${diffInDays !== 1 ? "s" : ""}`
        }

        return {
          id: job.id,
          company: job.company,
          position: job.title,
          date: format(createdAt, "MMM d, yyyy"),
          status: job.status,
          response: hasResponse,
          responseTime,
        }
      }) || []

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error in recent applications API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
