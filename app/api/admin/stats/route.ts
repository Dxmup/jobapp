import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminUser } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Admin stats API called")

    const adminUser = await getAdminUser()
    if (!adminUser) {
      console.log("Admin authentication failed")
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    console.log("Admin user authenticated:", adminUser.email)

    const supabase = createClient()

    // Get current date ranges
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    console.log("Fetching user stats...")

    // Get total users with error handling
    let totalUsers = 0
    let usersThisMonth = 0
    let usersLastMonth = 0

    try {
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true })
      totalUsers = count || 0
      console.log("Total users:", totalUsers)
    } catch (error) {
      console.error("Error fetching total users:", error)
    }

    try {
      const { count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisMonth.toISOString())
      usersThisMonth = count || 0
      console.log("Users this month:", usersThisMonth)
    } catch (error) {
      console.error("Error fetching users this month:", error)
    }

    try {
      const { count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString())
        .lt("created_at", thisMonth.toISOString())
      usersLastMonth = count || 0
      console.log("Users last month:", usersLastMonth)
    } catch (error) {
      console.error("Error fetching users last month:", error)
    }

    console.log("Fetching job stats...")

    // Get total job applications with error handling
    let totalApplications = 0
    let applicationsThisMonth = 0
    let applicationsLastMonth = 0

    try {
      const { count } = await supabase.from("jobs").select("*", { count: "exact", head: true })
      totalApplications = count || 0
      console.log("Total applications:", totalApplications)
    } catch (error) {
      console.error("Error fetching total applications:", error)
    }

    try {
      const { count } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisMonth.toISOString())
      applicationsThisMonth = count || 0
    } catch (error) {
      console.error("Error fetching applications this month:", error)
    }

    try {
      const { count } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString())
        .lt("created_at", thisMonth.toISOString())
      applicationsLastMonth = count || 0
    } catch (error) {
      console.error("Error fetching applications last month:", error)
    }

    console.log("Fetching content stats...")

    // Get total resumes and cover letters with error handling
    let totalResumes = 0
    let totalCoverLetters = 0

    try {
      const { count } = await supabase.from("resumes").select("*", { count: "exact", head: true })
      totalResumes = count || 0
    } catch (error) {
      console.error("Error fetching total resumes:", error)
    }

    try {
      const { count } = await supabase.from("cover_letters").select("*", { count: "exact", head: true })
      totalCoverLetters = count || 0
    } catch (error) {
      console.error("Error fetching total cover letters:", error)
    }

    // Get subscription data (if available)
    let activeSubscriptions = 0
    try {
      const { count } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
      activeSubscriptions = count || 0
    } catch (error) {
      console.log("Subscription table not available:", error)
    }

    // Calculate growth percentages
    const userGrowth =
      usersLastMonth && usersLastMonth > 0 ? Math.round(((usersThisMonth || 0) / usersLastMonth - 1) * 100) : 0

    const applicationGrowth =
      applicationsLastMonth && applicationsLastMonth > 0
        ? Math.round(((applicationsThisMonth || 0) / applicationsLastMonth - 1) * 100)
        : 0

    const stats = {
      totalUsers,
      totalApplications,
      totalResumes,
      totalCoverLetters,
      activeSubscriptions,
      totalRevenue: 0, // TODO: Implement when Stripe data is available
      aiTokensUsed: 0, // TODO: Implement when AI usage tracking is available
      userGrowth,
      applicationGrowth,
      revenueGrowth: 0,
      usersThisMonth,
      applicationsThisMonth,
    }

    console.log("Returning stats:", stats)
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error in admin stats API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch admin stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
