import { NextResponse } from "next/headers"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const allCookies = Object.fromEntries(cookieStore.getAll().map((c) => [c.name, c.value]))

    const supabase = createClient()

    // Try to get session from Supabase
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    return NextResponse.json({
      cookies: allCookies,
      supabaseSession: session
        ? {
            user: session.user,
            expires_at: session.expires_at,
          }
        : null,
      sessionError: sessionError?.message || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
  }
}
