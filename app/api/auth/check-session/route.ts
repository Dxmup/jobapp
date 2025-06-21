import { NextResponse } from "next/server"
import { isAuthenticated, getCurrentUserIdOptional } from "@/lib/auth-cookie"

export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    const userId = await getCurrentUserIdOptional()

    return NextResponse.json({
      success: true,
      authenticated,
      userId,
      authMethod: "cookie",
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
