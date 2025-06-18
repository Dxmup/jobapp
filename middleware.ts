import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware-client"

async function checkAdminStatus(userId: string, supabase: any): Promise<boolean> {
  try {
    const { data: user, error } = await supabase.from("users").select("email").eq("auth_id", userId).maybeSingle()
    if (error || !user?.email) {
      if (error) console.error("[Middleware:checkAdminStatus] Error fetching user email:", error.message)
      return false
    }
    const adminEmails = (process.env.ADMIN_EMAIL || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
    // Add other static admin emails if necessary, e.g., "admin@careerai.com"
    // adminEmails.push("admin@careerai.com", "test@admin.com");
    return adminEmails.includes(user.email.toLowerCase())
  } catch (error) {
    console.error("[Middleware:checkAdminStatus] Exception:", error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname
  const supabase = createMiddlewareSupabaseClient(request, response)

  console.log(`[Middleware] Path: ${path}`)
  // Optional: Log all cookies for deep debugging, can be noisy
  // const allCookies = request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0,30)}...`);
  // console.log(`[Middleware] Request cookies: ${allCookies.join('; ')}`);

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("[Middleware] supabase.auth.getSession() error:", sessionError.message)
    // Potentially problematic, but let's proceed and see if other logic handles it
  }
  console.log(
    `[Middleware] Session from supabase.auth.getSession(): ${session ? `User ID ${session.user.id}` : "null"}`,
  )

  // --- Auth Page Handling (Login/Signup) ---
  if (path === "/login" || path === "/signup") {
    if (session) {
      console.log("[Middleware] User HAS session, redirecting from auth page to /dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    console.log("[Middleware] User has NO session, allowing access to auth page:", path)
    return response // Allow access to login/signup if no session
  }

  // --- Admin Login Page Handling ---
  if (path === "/admin/login") {
    if (session && (await checkAdminStatus(session.user.id, supabase))) {
      console.log("[Middleware] Admin HAS session, redirecting from /admin/login to /admin")
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    console.log("[Middleware] Allowing access to /admin/login (either no session or not admin)")
    return response // Allow access if no session or not an admin trying to access admin dashboard
  }

  // --- Protected Route Handling (All other routes that need auth) ---
  const isProtectedPath =
    path.startsWith("/dashboard") ||
    path.startsWith("/jobs") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/admin")

  if (isProtectedPath) {
    if (!session) {
      const redirectUrl = path.startsWith("/admin") ? "/admin/login" : "/login"
      console.log(`[Middleware] User has NO session for protected path ${path}. Redirecting to ${redirectUrl}.`)
      const fullRedirectUrl = new URL(redirectUrl, request.url)
      fullRedirectUrl.searchParams.set("redirectedFrom", path)
      return NextResponse.redirect(fullRedirectUrl)
    }

    // If session exists, proceed with further checks (admin, onboarding)
    console.log("[Middleware] User HAS session for protected path:", path)

    // Admin path check (if not admin login page)
    if (path.startsWith("/admin")) {
      const isAdmin = await checkAdminStatus(session.user.id, supabase)
      if (!isAdmin) {
        console.log("[Middleware] User is NOT admin, redirecting from admin path to /dashboard")
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
      console.log("[Middleware] User IS admin, allowing access to admin path:", path)
    }

    // Onboarding check for non-admin paths
    if (!path.startsWith("/admin")) {
      try {
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("has_baseline_resume")
          .eq("auth_id", session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error("[Middleware] Error fetching user profile for onboarding:", profileError.message)
        } else if (userProfile) {
          if (!userProfile.has_baseline_resume && path !== "/onboarding") {
            console.log("[Middleware] User needs onboarding, redirecting to /onboarding")
            return NextResponse.redirect(new URL("/onboarding", request.url))
          }
          if (userProfile.has_baseline_resume && path === "/onboarding") {
            console.log("[Middleware] User completed onboarding, redirecting from /onboarding to /dashboard")
            return NextResponse.redirect(new URL("/dashboard", request.url))
          }
        } else {
          // No profile found, might be an issue or a very new user.
          // If /onboarding is where profile is created, this might be okay.
          // If not /onboarding, this could be an issue.
          console.warn("[Middleware] User profile not found for onboarding check. User ID:", session.user.id)
          if (path !== "/onboarding") {
            // If profile is expected and not found, and not on onboarding page, maybe redirect to onboarding.
            // For now, let's assume onboarding handles profile creation.
          }
        }
      } catch (error) {
        console.error("[Middleware] Exception during onboarding check:", error)
      }
    }
  }

  console.log(`[Middleware] Allowing access to (or no specific rule for): ${path}`)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     * - svgs/ (public svgs)
     * - assets/ (public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|svgs|assets).*)",
  ],
}
