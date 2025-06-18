import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { setupTwoFactorAuth } from "@/lib/two-factor-auth"

export async function POST() {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const result = await setupTwoFactorAuth(userId)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      secret: result.secret,
      otpAuthUrl: result.otpAuthUrl,
      backupCodes: result.backupCodes,
    })
  } catch (error) {
    console.error("Error in 2FA setup route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
