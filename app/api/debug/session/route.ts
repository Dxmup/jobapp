import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json(
        {
          error: sessionError.message,
          success: false,
        },
        { status: 500 },
      )
    }

    // If we have a session, get the user details from the users table
    let userData = null
    if (sessionData.session?.user) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", sessionData.session.user.id)
        .single()

      if (!userError) {
        userData = user
      } else {
        userData = { error: userError.message }
      }
    }

    return NextResponse.json({
      session: {
        ...sessionData,
        // Redact sensitive information
        session: sessionData.session
          ? {
              ...sessionData.session,
              access_token: sessionData.session.access_token ? "[REDACTED]" : null,
              refresh_token: sessionData.session.refresh_token ? "[REDACTED]" : null,
            }
          : null,
      },
      user: userData,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
