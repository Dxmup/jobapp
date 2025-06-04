import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAuditLogs, hasPermission } from "@/lib/auth-service"

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user has permission to view audit logs
  const canViewLogs = await hasPermission(userId, "system:read")

  if (!canViewLogs) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get("page") || "1")
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "20")

  const filters: any = {}

  if (searchParams.has("userId")) {
    filters.userId = searchParams.get("userId")
  }

  if (searchParams.has("action")) {
    filters.action = searchParams.get("action")
  }

  if (searchParams.has("resource")) {
    filters.resource = searchParams.get("resource")
  }

  if (searchParams.has("startDate")) {
    filters.startDate = new Date(searchParams.get("startDate") as string)
  }

  if (searchParams.has("endDate")) {
    filters.endDate = new Date(searchParams.get("endDate") as string)
  }

  try {
    const { logs, total } = await getAuditLogs(filters, page, pageSize)

    return NextResponse.json({ logs, total })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
