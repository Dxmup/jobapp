import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only allow landing page routes
  const allowedPaths = [
    "/",
    "/signup",
    "/api/waitlist",
    "/api/landing/generate-interview-questions",
    "/api/landing/optimize-resume",
    "/api/landing/generate-cover-letter",
  ]

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    pathname.startsWith("/audio") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next()
  }

  // Check if path is allowed
  const isAllowed = allowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*"],
}
