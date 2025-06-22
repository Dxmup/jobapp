import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("=== RESUMES FOR DROPDOWN API START ===")

    const cookieStore = cookies()
    const supabase = createServerSupabaseClient()

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    let userId = null

    if (session && !sessionError) {
      userId = session.user.id
      console.log("Found valid Supabase session for user:", userId)
    } else {
      // Fallback to cookie
      userId = cookieStore.get("user_id")?.value
      console.log("No Supabase session, trying cookie user ID:", userId)

      if (!userId) {
        console.error("No authentication found - no session and no user ID cookie")
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required. Please log in again.",
            details: "No valid session or user ID found",
          },
          { status: 401 },
        )
      }
    }

    console.log("Querying resumes for user:", userId)

    // Query resumes for the user
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("id, name, job_id, user_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error fetching resumes for dropdown:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch resumes from database",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`Successfully fetched ${resumes?.length || 0} resumes for dropdown for user ${userId}`)
    console.log("Resumes data:", resumes)
    console.log("=== RESUMES FOR DROPDOWN API END ===")

    return NextResponse.json({
      success: true,
      resumes: resumes || [],
    })
  } catch (error) {
    console.error("Unexpected error in resumes for-dropdown API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
