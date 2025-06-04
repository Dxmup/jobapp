import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("id")

    if (!jobId) {
      return NextResponse.json(
        {
          error: "Job ID is required",
          success: false,
        },
        { status: 400 },
      )
    }

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

    // Get the job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        users (
          id,
          auth_id,
          email
        )
      `)
      .eq("id", jobId)
      .single()

    if (jobError) {
      return NextResponse.json(
        {
          error: jobError.message,
          code: jobError.code,
          success: false,
        },
        { status: jobError.code === "PGRST116" ? 404 : 500 },
      )
    }

    // Check if the job_events table exists
    const { data: tableExists, error: tableError } = await supabase.rpc("table_exists", { table_name: "job_events" })

    // Check if there are any events for this job
    let events = []
    let eventsError = null

    if (tableExists) {
      const { data: eventsData, error: fetchEventsError } = await supabase
        .from("job_events")
        .select("*")
        .eq("job_id", jobId)

      events = eventsData || []
      eventsError = fetchEventsError
    }

    return NextResponse.json({
      job,
      currentUser: {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email,
      },
      ownership: {
        isOwner: job.users?.auth_id === sessionData.session.user.id,
        jobUserId: job.user_id,
        jobUserAuthId: job.users?.auth_id,
        currentUserAuthId: sessionData.session.user.id,
      },
      events: {
        tableExists: !!tableExists,
        count: events.length,
        error: eventsError ? eventsError.message : null,
      },
      success: true,
    })
  } catch (error) {
    console.error("Error fetching job details:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
