import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value
    const isAuthenticated = cookieStore.get("authenticated")?.value === "true"

    console.log("Session refresh attempt:", { userId, isAuthenticated })

    if (userId && isAuthenticated) {
      console.log("Cookie-based authentication is valid")
      return NextResponse.json({
        success: true,
        message: "Session is valid (cookie-based authentication)",
        authenticated: true,
        userId,
        authMethod: "cookie",
      })
    }

    console.log("No valid authentication found in cookies")
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
