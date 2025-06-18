import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase/authClient"

async function checkAdminStatus(userId: string): Promise<boolean> {
  try {
    const supabase = createMiddlewareClient({ cookies: { get: () => undefined } } as any, NextResponse.next())

    // Get user from database
    const { data: user, error } = await supabase.from("users").select("email").eq("auth_id", userId).single()

    if (error || !user?.email) {
      console.log(`No user found for auth_id: ${userId}`)
      return false
    }

    // Define admin emails
    const adminEmails = [
      "admin@careerai.com",
      "test@admin.com",
      "admin@test.com",
      "testing@careerai.com",
      "mctesterson@careerai.com",
      process.env.ADMIN_EMAIL,
    ]
      .filter(Boolean)
      .map((email) => email.toLowerCase())

    const isAdmin = adminEmails.includes(user.email.toLowerCase())
    console.log(`Admin check for ${user.email} (auth_id: ${userId}): ${isAdmin}`)

    return isAdmin
  } catch (error) {
    console.error("Error checking admin status in middleware:", error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient(request, response)

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const path = request.nextUrl.pathname
    console.log(`Middleware processing: ${path}, Session: ${session ? "exists" : "none"}`)

    // Special case for admin login page
    if (path === "/admin/login") {
      if (session && (await checkAdminStatus(session.user.id))) {
        console.log("Already authenticated admin, redirecting to admin dashboard")
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      return response
    }

    // Check if path requires authentication
    const protectedPath =
      path.startsWith("/dashboard") ||
      path.startsWith("/jobs") ||
      path.startsWith("/onboarding") ||
      path.startsWith("/admin")

    // Redirect unauthenticated users from protected routes
    if (!session && protectedPath) {
      const redirectUrl = path.startsWith("/admin") ? "/admin/login" : "/login"
      console.log(`Redirecting unauthenticated user from ${path} to ${redirectUrl}`)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Handle admin routes
    if (session && path.startsWith("/admin") && !path.startsWith("/admin/login")) {
      const isAdmin = await checkAdminStatus(session.user.id)
      if (!isAdmin) {
        console.log(`Non-admin user attempted to access admin route: ${path}`)
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Handle onboarding flow for authenticated users
    if (session && protectedPath && !path.startsWith("/admin")) {
      try {
        const { data: profile } = await supabase
          .from("users")
          .select("has_baseline_resume")
          .eq("auth_id", session.user.id)
          .maybeSingle()

        if (profile) {
          if (!profile.has_baseline_resume && !path.startsWith("/onboarding")) {
            console.log("User needs onboarding, redirecting")
            return NextResponse.redirect(new URL("/onboarding", request.url))
          }

          if (profile.has_baseline_resume && path.startsWith("/onboarding")) {
            console.log("User completed onboarding, redirecting to dashboard")
            return NextResponse.redirect(new URL("/dashboard", request.url))
          }
        }
      } catch (error) {
        console.error("Error checking user profile in middleware:", error)
        // Continue without redirect on error
      }
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    return response
  }
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
