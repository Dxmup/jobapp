import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient, createServerClient } from "@/lib/supabase/authClient"

async function checkAdminStatus(userId: string): Promise<boolean> {
  try {
    const supabase = createServerClient()

    // Get user from database
    const { data: user, error } = await supabase.from("users").select("email").eq("id", userId).single()

    if (error || !user?.email) {
      console.log(`No user found for ID: ${userId}`)
      return false
    }

    // Define admin emails
    const adminEmails = [
      "admin@careerai.com",
      "test@admin.com",
      "admin@test.com",
      "testing@careerai.com", // Jim Halpert
      "mctesterson@careerai.com", // Testy McTesterson
      process.env.ADMIN_EMAIL,
    ]
      .filter(Boolean)
      .map((email) => email.toLowerCase())

    const isAdmin = adminEmails.includes(user.email.toLowerCase())
    console.log(`Dynamic admin check for ${user.email} (ID: ${userId}): ${isAdmin}`)

    return isAdmin
  } catch (error) {
    console.error("Error checking admin status in middleware:", error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient(request, response)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  if (path === "/admin/login") {
    if (session && (await checkAdminStatus(session.user.id))) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return response
  }

  const protectedPath =
    path.startsWith("/dashboard") ||
    path.startsWith("/jobs") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/admin")

  if (!session && protectedPath) {
    return NextResponse.redirect(
      new URL(path.startsWith("/admin") ? "/admin/login" : "/login", request.url)
    )
  }

  if (session && path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    const isAdmin = await checkAdminStatus(session.user.id)
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  if (session && protectedPath && !path.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("users")
      .select("has_baseline_resume")
      .eq("id", session.user.id)
      .single()

    if (!profile?.has_baseline_resume && !path.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }

    if (profile?.has_baseline_resume && path.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/onboarding/:path*",
    "/onboarding",
    "/admin/:path*",
    "/admin",
    "/admin/login",
  ],
}
