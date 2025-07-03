import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAndEnableTwoFactorAuth } from "@/lib/two-factor-auth"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const result = await verifyAndEnableTwoFactorAuth(userId, token)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in 2FA verify route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
