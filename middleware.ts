import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware-client"

async function checkAdminStatus(userId: string, supabase: any): Promise<boolean> {
  try {
    const { data: user, error } = await supabase.from("users").select("email").eq("auth_id", userId).maybeSingle()

    if (error || !user?.email) {
      return false
    }

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

    return adminEmails.includes(user.email.toLowerCase())
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname

  // Create Supabase client for middleware using the same pattern as auth
  const supabase = createMiddlewareSupabaseClient(request, response)

  try {
    // Get session - this should now work with the same client pattern
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Middleware session error:", error)
    }

    console.log(`Middleware processing: ${path}`)
    console.log(`Session exists: ${!!session}`)
    if (session) {
      console.log(`Session user ID: ${session.user.id}`)
      console.log(`Session expires: ${new Date(session.expires_at! * 1000).toISOString()}`)
    }

    // Also check cookies as backup
    const authCookie = request.cookies.get("authenticated")?.value
    const userIdCookie = request.cookies.get("user_id")?.value
    console.log(`Auth cookie: ${authCookie}, User ID cookie: ${userIdCookie}`)

    // Skip middleware for auth pages to prevent loops
    if (path === "/login" || path === "/signup") {
      if (session) {
        console.log("Already authenticated, redirecting to dashboard")
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
      console.log("No session, allowing access to auth page")
      return response
    }

    // Special case for admin login page
    if (path === "/admin/login") {
      if (session && (await checkAdminStatus(session.user.id, supabase))) {
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
      console.log(`No session found, redirecting from ${path} to ${redirectUrl}`)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // If we have a session, update cookies to ensure they're fresh
    if (session) {
      response.cookies.set("authenticated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
      })

      response.cookies.set("user_id", session.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
      })
    }

    // Handle admin routes
    if (session && path.startsWith("/admin") && !path.startsWith("/admin/login")) {
      const isAdmin = await checkAdminStatus(session.user.id, supabase)
      if (!isAdmin) {
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
        console.error("Error checking user profile:", error)
      }
    }

    console.log(`Middleware allowing access to: ${path}`)
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
    "/login",
    "/signup",
  ],
}
