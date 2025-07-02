import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow landing page, signup, and essential assets
  const allowedPaths = [
    "/",
    "/signup",
    "/api/waitlist",
    "/_next",
    "/favicon.ico",
    "/audio",
    "/public",
    "/placeholder.svg",
    "/placeholder.jpg",
  ]

  // Check if the path is allowed
  const isAllowed = allowedPaths.some((path) => pathname === path || pathname.startsWith(path))

  // Redirect all other paths to landing page
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
