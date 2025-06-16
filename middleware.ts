import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get("authenticated")?.value === "true"
  const hasBaselineResume = request.cookies.get("has_baseline_resume")?.value === "true"
  const userId = request.cookies.get("user_id")?.value
  const isAdmin = request.cookies.get("is_admin")?.value === "true"
  const path = request.nextUrl.pathname

  console.log(`Middleware processing path: ${path}`)
  console.log(`Authentication status: ${isAuthenticated ? "authenticated" : "not authenticated"}`)

  // Special case for resume pages - allow access but client-side will handle auth
  if (path.startsWith("/dashboard/resumes")) {
    console.log("Resume page accessed, allowing access for client-side handling")
    return NextResponse.next()
  }

  // Special case for admin login page - allow access
  if (path === "/admin/login") {
    // If already authenticated as admin, redirect to admin dashboard
    if (isAuthenticated && isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
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

  // For admin routes, use the proper role check
  if (isAuthenticated && path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    if (!isAdmin) {
      console.log(`Non-admin user attempted to access admin route: ${path}`)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // If user is authenticated but doesn't have a baseline resume
  // and is trying to access dashboard or jobs (but not onboarding)
  if (
    isAuthenticated &&
    !hasBaselineResume &&
    (path.startsWith("/dashboard") || path.startsWith("/jobs")) &&
    !path.startsWith("/onboarding")
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
    "/dashboard/:path*",
    "/jobs/:path*",
    "/onboarding/:path*",
    "/onboarding",
    "/admin/:path*",
    "/admin",
    "/admin/login",
  ],
}
