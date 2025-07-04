import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow landing page and essential routes
  const allowedRoutes = [
    "/",
    "/signup",
    "/blogs",
    "/api/waitlist",
    "/api/landing/generate-interview-questions",
    "/api/landing/generate-cover-letter",
    "/api/landing/optimize-resume",
  ]

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/audio") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check if the current path is allowed
  const isAllowed = allowedRoutes.some((route) => {
    if (route === "/") return pathname === "/"
    if (route.startsWith("/api/")) return pathname.startsWith(route)
    return pathname.startsWith(route)
  })

  // Redirect login to signup
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/signup", request.url))
  }

  // If not allowed, redirect to home
  if (!isAllowed) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
