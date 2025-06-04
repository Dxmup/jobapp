import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get events directly without ownership check
    const { data: events, error: eventsError } = await supabase.from("job_events").select("*").eq("job_id", jobId)

    if (eventsError) {
      return NextResponse.json(
        {
          error: "Error fetching events",
          jobId,
          errorDetails: eventsError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      jobId,
      eventCount: events.length,
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        event_type: event.event_type,
        date: event.date,
      })),
    })
  } catch (error) {
    console.error("Error fetching events directly:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
