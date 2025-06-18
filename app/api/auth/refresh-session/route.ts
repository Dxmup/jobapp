import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value
    const isAuthenticated = cookieStore.get("authenticated")?.value === "true"

    console.log("Session refresh attempt:", { userId, isAuthenticated })

    // If we have cookie-based auth, that's sufficient
    if (userId && isAuthenticated) {
      console.log("Cookie-based authentication is valid, no refresh needed")
      return NextResponse.json({
        success: true,
        message: "Session is valid (cookie-based authentication)",
        authenticated: true,
        userId,
        authMethod: "cookie",
      })
    }

    // Try to get Supabase session as fallback
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Supabase session error:", error)
      return NextResponse.json(
        {
          success: false,
          message: "No active session found",
          error: error.message,
          authenticated: false,
        },
        { status: 401 },
      )
    }

    if (session?.user) {
      console.log("Supabase session found, updating cookies")

      // Update cookies with Supabase session data
      const response = NextResponse.json({
        success: true,
        message: "Session refreshed from Supabase",
        authenticated: true,
        userId: session.user.id,
        authMethod: "supabase",
      })

      // Set cookies
      response.cookies.set("user_id", session.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      response.cookies.set("authenticated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return response
    }

    // No valid session found
    console.log("No valid session found in either cookies or Supabase")
    return NextResponse.json(
      {
        success: false,
        message: "No active session found",
        authenticated: false,
        authMethod: "none",
      },
      { status: 401 },
    )
  } catch (error) {
    console.error("Session refresh error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to refresh session",
        error: error instanceof Error ? error.message : "Unknown error",
        authenticated: false,
      },
      { status: 500 },
    )
  }
}
