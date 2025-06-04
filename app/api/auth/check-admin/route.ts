import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isUserAdmin } from "@/lib/auth-service"

export async function GET() {
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    console.log("Admin check failed: No user ID found in cookies")
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }

  try {
    const isAdmin = await isUserAdmin(userId)
    console.log(`Admin check for user ${userId}: ${isAdmin ? "is admin" : "not admin"}`)

    if (!isAdmin) {
      return NextResponse.json({ isAdmin: false }, { status: 403 })
    }

    return NextResponse.json({ isAdmin: true })
  } catch (error) {
    console.error("Admin check error:", error)
    return NextResponse.json({ isAdmin: false, error: "Server error" }, { status: 500 })
  }
}
