import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserRoles } from "@/lib/auth-service"
import { getRolesFromToken } from "@/lib/jwt-utils"

export async function GET() {
  try {
    // First try to get roles from JWT token for better performance
    const rolesFromToken = await getRolesFromToken()

    if (rolesFromToken.length > 0) {
      return NextResponse.json({ roles: rolesFromToken })
    }

    // Fallback to database lookup
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ roles: [] })
    }

    const roles = await getUserRoles(userId)
    return NextResponse.json({ roles })
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ roles: [] }, { status: 500 })
  }
}
