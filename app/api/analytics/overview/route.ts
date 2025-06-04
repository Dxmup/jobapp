import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserIdentity } from "@/lib/user-identity"

export async function GET(request: Request) {
  try {
    const user = await getUserIdentity()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30"

    const supabase = createServerSupabaseClient()
    const userId = user.id

    // Calculate date range based on period
    const endDate = new Date()
    let startDate = new Date()

    if (period === "7") {
      startDate.setDate(endDate.getDate() - 7)
    } else if (period === "30") {
      startDate.setDate(endDate.getDate() - 30)
    } else if (period === "90") {
      startDate.setDate(endDate.getDate() - 90)
    } else if (period === "365") {
      startDate.setDate(endDate.getDate() - 365)
    } else {
      // "all" - set to a date far in the past
      startDate = new Date(0)
    }

    // For comparison with previous period
    const previousStartDate = new Date(startDate)
    const previousEndDate = new Date(startDate)

    if (period === "7") {
      previousStartDate.setDate(previousStartDate.getDate() - 7)
    } else if (period === "30") {
      previousStartDate.setDate(previousStartDate.getDate() - 30)
    } else if (period === "90") {
      previousStartDate.setDate(previousStartDate.getDate() - 90)
    } else if (period === "365") {
      previousStartDate.setDate(previousStartDate.getDate() - 365)
    }

    // Format dates for Supabase queries
    const startDateStr = startDate.toISOString()
    const previousStartDateStr = previousStartDate.toISOString()
    const previousEndDateStr = previousEndDate.toISOString()

    // Get all applications in the current period
    const { data: currentApplications, error: currentError } = await supabase
      .from("jobs")
      .select("id, status, created_at, updated_at")
      .eq("user_id", userId)
      .gte("created_at", startDateStr)

    if (currentError) {
      console.error("Error fetching current applications:", currentError)
      return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
    }

    // Get all applications in the previous period for comparison
    const { data: previousApplications, error: previousError } = await supabase
      .from("jobs")
      .select("id, status, created_at")
      .eq("user_id", userId)
      .gte("created_at", previousStartDateStr)
      .lt("created_at", previousEndDateStr)

    if (previousError) {
      console.error("Error fetching previous applications:", previousError)
    }

    // Calculate metrics
    const totalApplications = currentApplications?.length || 0
    const previousTotalApplications = previousApplications?.length || 0

    // Calculate application trend (percentage change)
    let applicationTrend = 0
    if (previousTotalApplications > 0) {
      applicationTrend = Math.round(((totalApplications - previousTotalApplications) / previousTotalApplications) * 100)
    }

    // Calculate response rate
    const responsesReceived =
      currentApplications?.filter((app) => ["interview", "interviewing", "offer", "rejected"].includes(app.status))
        .length || 0

    const previousResponsesReceived =
      previousApplications?.filter((app) => ["interview", "interviewing", "offer", "rejected"].includes(app.status))
        .length || 0

    const responseRate = totalApplications > 0 ? Math.round((responsesReceived / totalApplications) * 100) : 0
    const previousResponseRate =
      previousTotalApplications > 0 ? Math.round((previousResponsesReceived / previousTotalApplications) * 100) : 0

    const responseRateTrend = previousResponseRate > 0 ? responseRate - previousResponseRate : 0

    // Calculate interviews
    const interviews =
      currentApplications?.filter((app) => ["interview", "interviewing", "offer"].includes(app.status)).length || 0

    const previousInterviews =
      previousApplications?.filter((app) => ["interview", "interviewing", "offer"].includes(app.status)).length || 0

    const interviewsTrend = previousInterviews > 0 ? interviews - previousInterviews : interviews

    // Calculate applications by status
    const applicationsByStatus = {
      drafting: currentApplications?.filter((app) => app.status === "drafting" || app.status === "saved").length || 0,
      applied: currentApplications?.filter((app) => app.status === "applied").length || 0,
      interviewing:
        currentApplications?.filter((app) => app.status === "interview" || app.status === "interviewing").length || 0,
      offer: currentApplications?.filter((app) => app.status === "offer").length || 0,
      rejected: currentApplications?.filter((app) => app.status === "rejected").length || 0,
      noResponse:
        currentApplications?.filter(
          (app) => app.status === "applied" && !["interview", "interviewing", "offer", "rejected"].includes(app.status),
        ).length || 0,
    }

    return NextResponse.json({
      totalApplications,
      responseRate,
      interviews,
      applicationsByStatus,
      applicationTrend,
      responseRateTrend,
      interviewsTrend,
    })
  } catch (error) {
    console.error("Error in analytics overview API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
