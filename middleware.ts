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
      .map((email) => (email as string).toLowerCase())

    return adminEmails.includes(user.email.toLowerCase())
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname

  const supabase = createMiddlewareSupabaseClient(request, response)

  console.log(`[Middleware] Path: ${path}`)
  const allCookies = request.cookies.getAll()
  console.log(
    "[Middleware] All request cookies:",
    allCookies.map((c) => ({ name: c.name, value: c.value.substring(0, 50) + (c.value.length > 50 ? "..." : "") })),
  ) // Log cookie names and truncated values

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("[Middleware] supabase.auth.getSession() error:", sessionError.message)
  }
  console.log(`[Middleware] Session from supabase.auth.getSession(): ${session ? session.user.id : "null"}`)

  // Skip middleware for auth pages to prevent loops if already there
  if (path === "/login" || path === "/signup") {
    if (session) {
      console.log("[Middleware] User has session, redirecting from auth page to /dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    console.log("[Middleware] No session, allowing access to auth page:", path)
    return response
  }

  // Special case for admin login page
  if (path === "/admin/login") {
    if (session && (await checkAdminStatus(session.user.id, supabase))) {
      console.log("[Middleware] Admin has session, redirecting from /admin/login to /admin")
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    console.log("[Middleware] Allowing access to /admin/login")
    return response
  }

  const protectedPath =
    path.startsWith("/dashboard") ||
    path.startsWith("/jobs") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/admin")

  if (!session && protectedPath) {
    const redirectUrl = path.startsWith("/admin") ? "/admin/login" : "/login"
    console.log(`[Middleware] No session for protected path ${path}, redirecting to ${redirectUrl}`)
    const fullRedirectUrl = new URL(redirectUrl, request.url)
    fullRedirectUrl.searchParams.set("redirectedFrom", path) // Add info for debugging
    return NextResponse.redirect(fullRedirectUrl)
  }

  // If session exists, ensure our custom cookies are also set (e.g., if session was refreshed by Supabase)
  // This part might be redundant if actions always set them, but good for robustness.
  if (session) {
    const authenticatedCookie = request.cookies.get("authenticated")?.value
    const userIdCookie = request.cookies.get("user_id")?.value

    if (authenticatedCookie !== "true") {
      response.cookies.set("authenticated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
      })
      console.log("[Middleware] Set 'authenticated' cookie as session exists but cookie was missing/incorrect.")
    }
    if (userIdCookie !== session.user.id) {
      response.cookies.set("user_id", session.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
      })
      console.log(
        `[Middleware] Set/Updated 'user_id' cookie to ${session.user.id} as session exists but cookie was missing/incorrect.`,
      )
    }
  }

  if (session && path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    const isAdmin = await checkAdminStatus(session.user.id, supabase)
    if (!isAdmin) {
      console.log("[Middleware] User is not admin, redirecting from /admin to /dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  if (session && protectedPath && !path.startsWith("/admin")) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("has_baseline_resume")
        .eq("auth_id", session.user.id)
        .maybeSingle()

      if (profileError) {
        console.error("[Middleware] Error fetching user profile for onboarding check:", profileError.message)
      } else if (profile) {
        if (!profile.has_baseline_resume && !path.startsWith("/onboarding")) {
          console.log("[Middleware] User needs onboarding (has_baseline_resume=false), redirecting to /onboarding")
          return NextResponse.redirect(new URL("/onboarding", request.url))
        }
        if (profile.has_baseline_resume && path.startsWith("/onboarding")) {
          console.log(
            "[Middleware] User completed onboarding (has_baseline_resume=true), redirecting from /onboarding to /dashboard",
          )
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      } else {
        console.log(
          "[Middleware] No profile found for onboarding check, user might be new or an issue exists. Allowing access for now.",
        )
      }
    } catch (error) {
      console.error("[Middleware] Exception checking user profile for onboarding:", error)
    }
  }

  console.log(`[Middleware] Allowing access to: ${path}`)
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|svgs).*)",
  ],
}
