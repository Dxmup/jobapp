import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerSupabaseClient()

    console.log("=== Resume Auth Debug Test ===")

    // Check session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    console.log("Session error:", sessionError)
    console.log("Session exists:", !!session)
    console.log("Session user ID:", session?.user?.id)

    // Check cookies
    const userIdCookie = cookieStore.get("user_id")?.value
    console.log("User ID cookie:", userIdCookie)

    // Determine user ID
    let userId = null
    if (session && !sessionError) {
      userId = session.user.id
    } else {
      userId = userIdCookie
    }

    console.log("Final user ID:", userId)

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "No authentication found",
        debug: {
          hasSession: !!session,
          sessionError: sessionError?.message,
          hasCookie: !!userIdCookie,
          cookieValue: userIdCookie,
        },
      })
    }

    // Test database query
    const { data: resumes, error: dbError } = await supabase
      .from("resumes")
      .select("id, name, user_id")
      .eq("user_id", userId)
      .limit(5)

    console.log("Database error:", dbError)
    console.log("Resume count:", resumes?.length || 0)

    return NextResponse.json({
      success: true,
      debug: {
        hasSession: !!session,
        sessionUserId: session?.user?.id,
        cookieUserId: userIdCookie,
        finalUserId: userId,
        resumeCount: resumes?.length || 0,
        dbError: dbError?.message,
      },
      resumes: resumes || [],
    })
  } catch (error) {
    console.error("Debug test error:", error)
    return NextResponse.json({
      success: false,
      error: "Debug test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
