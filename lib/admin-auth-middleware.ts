import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserIdOptional } from "./auth-cookie"
import { isUserAdmin } from "./auth-service"

export async function requireAdminAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Check if user is authenticated
    const userId = await getCurrentUserIdOptional()

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin
    const adminStatus = await isUserAdmin(userId)

    if (!adminStatus) {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
    }

    // User is authenticated and is admin
    return null
  } catch (error) {
    console.error("Admin auth middleware error:", error)
    return NextResponse.json({ error: "Authentication error" }, { status: 500 })
  }
}
