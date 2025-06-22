import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { endAdminSession } from "@/lib/admin-session"

export async function POST() {
  try {
    // End the admin session
    await endAdminSession()

    // Clear all authentication cookies
    const cookieStore = cookies()
    cookieStore.delete("authenticated")
    cookieStore.delete("user_id")
    cookieStore.delete("is_admin")
    cookieStore.delete("role_token")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin logout error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
