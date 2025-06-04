import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { hasPermission } from "@/lib/auth-service"

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value
  const permissionId = request.nextUrl.searchParams.get("permissionId")

  if (!userId || !permissionId) {
    return NextResponse.json({ hasPermission: false }, { status: 400 })
  }

  try {
    const permitted = await hasPermission(userId, permissionId)
    return NextResponse.json({ hasPermission: permitted })
  } catch (error) {
    console.error("Permission check error:", error)
    return NextResponse.json({ hasPermission: false }, { status: 500 })
  }
}
