import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // First, get all jobs for this user
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, company")
      .eq("user_id", userId)

    if (jobsError) {
      console.error("Error fetching user jobs:", jobsError)
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ events: [] })
    }

    const jobIds = jobs.map((job) => job.id)

    // Now query for events for these jobs
    const { data: jobEvents, error: eventsError } = await supabase.from("job_events").select("*").in("job_id", jobIds)

    if (eventsError) {
      console.error("Error fetching job events:", eventsError)
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }

    // Format events for the calendar
    const calendarEvents = jobEvents.map((event) => {
      const job = jobs.find((j) => j.id === event.job_id)

      // Determine event color based on event type
      let backgroundColor = "#3b82f6" // Default blue

      switch (event.event_type) {
        case "interview":
        case "interview_scheduled":
          backgroundColor = "#10b981" // Green
          break
        case "phone_call":
          backgroundColor = "#f59e0b" // Yellow
          break
        case "email_sent":
        case "email_received":
          backgroundColor = "#8b5cf6" // Purple
          break
        case "meeting":
          backgroundColor = "#ec4899" // Pink
          break
        case "offer":
          backgroundColor = "#059669" // Emerald
          break
        case "rejection":
          backgroundColor = "#ef4444" // Red
          break
      }

      // Parse the date to determine if it has a specific time
      const eventDate = new Date(event.date)
      const hasTime = eventDate.getHours() !== 0 || eventDate.getMinutes() !== 0

      return {
        id: event.id,
        title: event.title,
        start: event.date,
        allDay: !hasTime,
        backgroundColor,
        borderColor: backgroundColor,
        extendedProps: {
          jobId: event.job_id,
          jobTitle: job?.title || "Unknown Job",
          company: job?.company || "Unknown Company",
          eventType: event.event_type,
          description: event.description,
        },
      }
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
          calendarEvents.push({
            id: `job-${job.id}`,
            title: `Applied to ${job.title}`,
            start: job.applied_at,
            allDay: true,
            backgroundColor: "#6366f1", // Indigo
            borderColor: "#6366f1",
            extendedProps: {
              jobId: job.id,
              jobTitle: job.title,
              company: job.company,
              eventType: "application",
              description: `Application submitted for ${job.title} at ${job.company}`,
            },
          })
        }
      })
    }

    return NextResponse.json({ events: calendarEvents })
  } catch (error) {
    console.error("Error in calendar events API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
