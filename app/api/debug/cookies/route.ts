import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()

    // Create a safe version of cookies to return (don't expose sensitive values)
    const safeCookies = allCookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.name === "user_id" ? cookie.value : "[REDACTED]",
      exists: true,
    }))

    // Add specific checks for important cookies
    const userId = cookieStore.get("user_id")?.value
    const authenticated = cookieStore.get("authenticated")?.value

    return NextResponse.json({
      cookies: safeCookies,
      important: {
        userId: userId ? { exists: true, value: userId } : { exists: false },
        authenticated: authenticated ? { exists: true, value: authenticated } : { exists: false },
      },
    })
  } catch (error) {
    console.error("Error in cookies debug API:", error)
    return NextResponse.json(
      {
        error: "Failed to get cookies",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
