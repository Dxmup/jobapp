import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [API] Fetching jobs for user...")

    const cookieStore = cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    // Get session first
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("❌ [API] Session error:", sessionError)
      return NextResponse.json({ success: false, error: "Session error" }, { status: 401 })
    }

    let userId = session?.user?.id

    // Fallback to cookie if no session
    if (!userId) {
      userId = cookieStore.get("user_id")?.value
      console.log("🔄 [API] Using cookie fallback for user ID:", userId)
    }

    if (!userId) {
      console.error("❌ [API] No user ID found")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("✅ [API] Getting jobs for user:", userId)

    // Fetch jobs for the user
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("id, title, company, description, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ [API] Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 })
    }

    console.log("✅ [API] Found", jobs?.length || 0, "jobs")

    // Return simplified job data for dropdown
    const jobsForDropdown = (jobs || []).map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      status: job.status,
      description: job.description,
    }))

    return NextResponse.json({ success: true, jobs: jobsForDropdown })
  } catch (error) {
    console.error("❌ [API] Unexpected error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 })
  }
}
