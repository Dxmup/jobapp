import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyTwoFactorToken } from "@/lib/two-factor-auth"
import { createAdminSession } from "@/lib/admin-session"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Get client IP and user agent
    const headersList = headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Verify the 2FA code
    const result = await verifyTwoFactorToken(userId, code)

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 })
    }

    // Create admin session
    const sessionResult = await createAdminSession(userId, ipAddress, userAgent)

    if (!sessionResult.success) {
      console.error("Failed to create admin session:", sessionResult.error)
      return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 })
    }

    // Set 2FA verified cookie
    cookieStore.set("2fa_verified", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in verify-2fa route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
