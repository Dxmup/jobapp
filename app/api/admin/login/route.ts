import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserByEmail, isUserAdmin } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user by email
    const user = await getUserByEmail(email.toLowerCase())
    if (!user) {
      console.log(`Admin login failed: User not found for email ${email}`)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is admin
    const adminStatus = await isUserAdmin(user.id)
    if (!adminStatus) {
      console.log(`Admin login failed: User ${email} is not an admin`)
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 })
    }

    console.log(`Admin login successful for ${email}`)

    // Set cookies for admin session
    const cookieStore = cookies()
    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } })

    // Set secure cookies
    response.cookies.set("authenticated", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.set("user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.set("is_admin", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.set("has_baseline_resume", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
