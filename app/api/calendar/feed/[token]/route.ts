import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createEvents, type EventAttributes } from "ics"

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Find the user associated with this token
    const { data: tokenData, error: tokenError } = await supabase
      .from("user_calendar_tokens")
      .select("user_id")
      .eq("token", token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 })
    }

    const userId = tokenData.user_id

    // Get all jobs for this user
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, company")
      .eq("user_id", userId)

    if (jobsError) {
      console.error("Error fetching user jobs:", jobsError)
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    if (!jobs || jobs.length === 0) {
      // Return empty calendar if no jobs
      const { error, value } = createEvents([])
      if (error) throw error

      return new NextResponse(value, {
        headers: {
          "Content-Type": "text/calendar",
        },
      })
    }

    const jobIds = jobs.map((job) => job.id)

    // Query for events for these jobs
    const { data: jobEvents, error: eventsError } = await supabase.from("job_events").select("*").in("job_id", jobIds)

    if (eventsError) {
      console.error("Error fetching job events:", eventsError)
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }

    // Format events for iCal
    const icalEvents: EventAttributes[] = jobEvents.map((event) => {
      const job = jobs.find((j) => j.id === event.job_id)
      const eventDate = new Date(event.date)

      // Format date for ics
      const year = eventDate.getFullYear()
      const month = eventDate.getMonth() + 1 // Month is 0-indexed
      const day = eventDate.getDate()
      const hours = eventDate.getHours()
      const minutes = eventDate.getMinutes()

      // Determine if it's an all-day event
      const hasTime = hours !== 0 || minutes !== 0

      const icalEvent: EventAttributes = {
        title: event.title,
        description: `${event.description || ""}\n\nJob: ${job?.title || "Unknown"}\nCompany: ${job?.company || "Unknown"}`,
        start: hasTime ? [year, month, day, hours, minutes] : [year, month, day],
        startInputType: hasTime ? "local" : "utc",
        productId: "CareerAI/events",
        calName: "CareerAI Job Events",
        status: "CONFIRMED",
        busyStatus: "BUSY",
        organizer: { name: "CareerAI", email: "calendar@careerai.example.com" },
      }

      // Add duration for non-all-day events
      if (hasTime) {
        icalEvent.duration = { hours: 1 } // Default to 1 hour
      }

      return icalEvent
    })

    // Add job application dates as events
    const { data: jobsWithDates, error: jobDatesError } = await supabase
      .from("jobs")
      .select("id, title, company, applied_at, status")
      .eq("user_id", userId)
      .not("applied_at", "is", null)

    if (!jobDatesError && jobsWithDates) {
      jobsWithDates.forEach((job) => {
        if (job.applied_at) {
          const appDate = new Date(job.applied_at)
          icalEvents.push({
            title: `Applied to ${job.title}`,
            description: `Job application submitted for ${job.title} at ${job.company}`,
            start: [appDate.getFullYear(), appDate.getMonth() + 1, appDate.getDate()],
            startInputType: "utc",
            productId: "CareerAI/applications",
            calName: "CareerAI Job Applications",
            status: "CONFIRMED",
            busyStatus: "FREE",
          })
        }
      })
    }

    // Generate iCal file
    const { error, value } = createEvents(icalEvents)

    if (error) {
      console.error("Error creating iCal events:", error)
      return NextResponse.json({ error: "Failed to create calendar" }, { status: 500 })
    }

    // Return the iCal file
    return new NextResponse(value, {
      headers: {
        "Content-Type": "text/calendar",
      },
    })
  } catch (error) {
    console.error("Error in calendar feed API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
