import { NextResponse } from "next/server"
import { requireAuthenticatedUserId } from "@/lib/auth-helpers"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Single source of truth for authentication
    const userId = await requireAuthenticatedUserId()
    const supabase = createServerSupabaseClient()

    console.log(`Direct API: Fetching resumes for authenticated user: ${userId}`)

    // Query resumes using admin client (bypasses RLS)
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Direct API: Database error fetching resumes:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch resumes from database",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`Direct API: Successfully fetched ${resumes?.length || 0} resumes for user ${userId}`)

    return NextResponse.json({
      success: true,
      resumes: resumes || [],
      count: resumes?.length || 0,
    })
  } catch (error) {
    console.error("Direct API: Unexpected error:", error)

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

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
