import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

async function checkAdminStatus(userId: string): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient()

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
  const isAuthenticated = request.cookies.get("authenticated")?.value === "true"
  const hasBaselineResume = request.cookies.get("has_baseline_resume")?.value === "true"
  const userId = request.cookies.get("user_id")?.value
  const isAdminCookie = request.cookies.get("is_admin")?.value === "true"
  const path = request.nextUrl.pathname

  // Skip middleware for API routes to prevent loops
  if (path.startsWith("/api/")) {
    return NextResponse.next()
  }

  console.log(`Middleware processing path: ${path}`)
  console.log(`Authentication status: ${isAuthenticated ? "authenticated" : "not authenticated"}`)
  console.log(`Admin cookie: ${isAdminCookie ? "admin" : "not admin"}`)
  console.log(`User ID: ${userId}`)

  // Special case for admin login page - allow access
  if (path === "/admin/login") {
    // If already authenticated, check if they're admin and redirect accordingly
    if (isAuthenticated && userId) {
      const isActuallyAdmin = await checkAdminStatus(userId)
      if (isActuallyAdmin) {
        console.log("Already authenticated admin, redirecting to admin dashboard")
        return NextResponse.redirect(new URL("/admin", request.url))
      }
    }
    return NextResponse.next()
  }

  // Special case for resume pages - allow access but client-side will handle auth
  if (path.startsWith("/dashboard/resumes")) {
    console.log("Resume page accessed, allowing access for client-side handling")
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access protected routes
  if (
    !isAuthenticated &&
    (path.startsWith("/dashboard") ||
      path.startsWith("/jobs") ||
      path.startsWith("/onboarding") ||
      path.startsWith("/admin")) &&
    !path.startsWith("/dashboard/resumes") // Exclude resume pages from middleware auth check
  ) {
    // For admin routes, redirect to admin login
    if (path.startsWith("/admin")) {
      console.log(`Redirecting unauthenticated user to admin login from ${path}`)
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // For other protected routes, redirect to regular login
    console.log(`Redirecting unauthenticated user to login from ${path}`)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // For admin routes, check admin privileges dynamically
  if (isAuthenticated && path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    if (!userId) {
      console.log(`No user ID found, redirecting to login`)
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Check admin status dynamically instead of relying on cookie
    const isActuallyAdmin = await checkAdminStatus(userId)

    if (!isActuallyAdmin) {
      console.log(`Non-admin user attempted to access admin route: ${path}`)
      console.log(`User ID: ${userId}, dynamic admin check: false`)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    console.log(`Admin user accessing admin route: ${path}`)

    // Update the admin cookie if it's incorrect
    if (!isAdminCookie) {
      console.log("Updating admin cookie to true")
      const response = NextResponse.next()
      response.cookies.set("is_admin", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
      return response
    }
  }

  // If user is authenticated but doesn't have a baseline resume
  // and is trying to access dashboard or jobs (but not onboarding or admin)
  if (
    isAuthenticated &&
    !hasBaselineResume &&
    (path.startsWith("/dashboard") || path.startsWith("/jobs")) &&
    !path.startsWith("/onboarding") &&
    !path.startsWith("/admin")
  ) {
    console.log(`Redirecting user without baseline resume to onboarding`)
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  // If user is authenticated, has a baseline resume, and is trying to access onboarding
  if (isAuthenticated && hasBaselineResume && path.startsWith("/onboarding")) {
    console.log(`Redirecting user with baseline resume from onboarding to dashboard`)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/dashboard/:path*",
    "/jobs/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
  ],
}
