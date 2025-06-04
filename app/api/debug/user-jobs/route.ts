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

    if (!sessionData.session) {
      return NextResponse.json(
        {
          error: "No active session",
          success: false,
        },
        { status: 401 },
      )
    }

    // Get the user details from the users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", sessionData.session.user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        {
          error: userError.message,
          code: userError.code,
          authUser: {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
          },
          success: false,
        },
        { status: userError.code === "PGRST116" ? 404 : 500 },
      )
    }

    // Get the jobs for this user
    const { data: jobs, error: jobsError } = await supabase.from("jobs").select("*").eq("user_id", user.id)

    return NextResponse.json({
      user: {
        ...user,
        auth_id: user.auth_id, // Include auth_id for comparison
      },
      authUser: {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email,
      },
      jobs: {
        count: jobs?.length || 0,
        list: jobs || [],
        error: jobsError ? jobsError.message : null,
      },
      success: true,
    })
  } catch (error) {
    console.error("Error fetching user jobs:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
