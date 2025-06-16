import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isUserAdmin } from "@/lib/auth-service"
import { setRoleToken } from "@/lib/jwt-utils"
import { createAdminSession } from "@/lib/admin-session"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const supabase = createServerSupabaseClient()

    // Get client IP and user agent
    const headersList = headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Check if the user has admin role
    const isAdmin = await isUserAdmin(data.user.id)

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Not authorized as admin" }, { status: 403 })
    }

    // Set cookies for authentication
    const cookieStore = cookies()
    cookieStore.set("authenticated", "true", { path: "/", httpOnly: true, sameSite: "lax" })
    cookieStore.set("user_id", data.user.id, { path: "/", httpOnly: true, sameSite: "lax" })
    cookieStore.set("is_admin", "true", { path: "/", httpOnly: true, sameSite: "lax" })

    // Set JWT with roles
    await setRoleToken(data.user.id)

    // Create admin session
    const sessionResult = await createAdminSession(data.user.id, ipAddress, userAgent)

    if (!sessionResult.success) {
      console.error("Failed to create admin session:", sessionResult.error)
      // Continue anyway, as the JWT authentication will still work
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
