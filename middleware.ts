import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

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

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  try {
    // Get session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Middleware session error:", error)
    }

    console.log(`Middleware processing: ${path}, Session: ${session ? "exists" : "none"}`)

    if (session) {
      console.log(`Session user: ${session.user.id}`)
    }

    // Skip middleware for auth pages to prevent loops
    if (path === "/login" || path === "/signup") {
      if (session) {
        console.log("Already authenticated, redirecting to dashboard")
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
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
      console.log(`Redirecting unauthenticated user from ${path} to ${redirectUrl}`)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
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
            return NextResponse.redirect(new URL("/onboarding", request.url))
          }

          if (profile.has_baseline_resume && path.startsWith("/onboarding")) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
          }
        }
      } catch (error) {
        console.error("Error checking user profile:", error)
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
    "/login",
    "/signup",
  ],
}
