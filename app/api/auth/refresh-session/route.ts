import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json(
        {
          success: false,
          message: "Session error",
          error: sessionError.message,
        },
        { status: 401 },
      )
    }

    if (!session) {
      console.log("No active session found during refresh attempt")
      return NextResponse.json(
        {
          success: false,
          message: "No active session found",
        },
        { status: 401 },
      )
    }

    console.log("Active session found, user ID:", session.user.id)

    // Try to refresh the session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

    if (refreshError) {
      console.error("Refresh error:", refreshError)
      // Even if refresh fails, if we have a valid session, continue
      if (!session) {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to refresh session",
            error: refreshError.message,
          },
          { status: 401 },
        )
      }
    }

    const finalSession = refreshData?.session || session
    const userId = finalSession.user.id

    // Set cookies to ensure consistency
    const response = NextResponse.json({
      success: true,
      message: "Session refreshed successfully",
      user: {
        id: userId,
        email: finalSession.user.email,
      },
    })

    response.cookies.set("user_id", userId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })

    response.cookies.set("authenticated", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })

    // Check if user has baseline resume
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("has_baseline_resume")
        .eq("auth_id", userId)
        .single()

      if (!userError && userData) {
        response.cookies.set("has_baseline_resume", userData.has_baseline_resume ? "true" : "false", {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          sameSite: "lax",
        })
      }
    } catch (userError) {
      console.error("Error fetching user data:", userError)
      // Don't fail the whole request for this
    }

    return response
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to refresh session",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
