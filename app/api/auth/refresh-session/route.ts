import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get the current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Session error:", error)
      return NextResponse.json({ error: "Failed to get session" }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    // Refresh the session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

    if (refreshError) {
      console.error("Session refresh error:", refreshError)
      return NextResponse.json({ error: "Failed to refresh session" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: "Session refreshed successfully",
      user: refreshData.user,
    })
  } catch (error) {
    console.error("Unexpected error in refresh-session:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
