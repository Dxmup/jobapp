import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const actions = []
    const now = new Date()

    // Get user's jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, company, status, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError)
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    // Get user's resumes
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("id, title, created_at")
      .eq("user_id", user.id)

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
      return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
    }

    // Get upcoming events
    const { data: events, error: eventsError } = await supabase
      .from("job_events")
      .select("id, job_id, event_type, event_date, notes")
      .eq("user_id", user.id)
      .gte("event_date", now.toISOString())
      .order("event_date", { ascending: true })

    if (eventsError) {
      console.error("Error fetching events:", eventsError)
    }

    // Generate actions based on user data
    if (jobs && jobs.length > 0) {
      jobs.forEach((job) => {
        const daysSinceCreated = Math.floor(
          (now.getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24),
        )
        const daysSinceUpdated = Math.floor(
          (now.getTime() - new Date(job.updated_at).getTime()) / (1000 * 60 * 60 * 24),
        )

        // Suggest follow-up if job is old and status is applied
        if (job.status === "applied" && daysSinceUpdated >= 7) {
          actions.push({
            id: `followup-${job.id}`,
            title: `Follow up on application to ${job.company}`,
            description: `It's been ${daysSinceUpdated} days since you applied. Consider sending a follow-up email.`,
            dueDate: daysSinceUpdated >= 14 ? "Overdue" : "This week",
            category: "Follow-ups",
            status: "upcoming" as const,
            priority: daysSinceUpdated >= 14 ? ("high" as const) : ("medium" as const),
            jobId: job.id,
            actionUrl: `/jobs/${job.id}`,
          })
        }

        // Suggest interview prep if status is interview scheduled
        if (job.status === "interview_scheduled") {
          actions.push({
            id: `prep-${job.id}`,
            title: `Prepare for interview with ${job.company}`,
            description: `Review common interview questions and research the company culture.`,
            dueDate: "This week",
            category: "Interviews",
            status: "upcoming" as const,
            priority: "high" as const,
            jobId: job.id,
            actionUrl: `/dashboard/interview-prep/${job.id}`,
          })
        }

        // Suggest creating cover letter if job is draft
        if (job.status === "draft" || !job.status) {
          actions.push({
            id: `cover-letter-${job.id}`,
            title: `Create cover letter for ${job.title} at ${job.company}`,
            description: `Complete your application by writing a personalized cover letter.`,
            dueDate: daysSinceCreated >= 3 ? "Overdue" : "Today",
            category: "Applications",
            status: "upcoming" as const,
            priority: daysSinceCreated >= 3 ? ("high" as const) : ("medium" as const),
            jobId: job.id,
            actionUrl: `/jobs/${job.id}/generate-cover-letter`,
          })
        }
      })
    }

    // Suggest creating resume if user has none
    if (!resumes || resumes.length === 0) {
      actions.push({
        id: "create-resume",
        title: "Create your first resume",
        description: "Build a professional resume to start applying for jobs.",
        dueDate: "Today",
        category: "Resume",
        status: "upcoming" as const,
        priority: "high" as const,
        actionUrl: "/dashboard/build-resume",
      })
    }

    // Add upcoming interview events
    if (events && events.length > 0) {
      events.forEach((event) => {
        const eventDate = new Date(event.event_date)
        const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        let dueDateText = "Today"
        if (daysUntil === 1) dueDateText = "Tomorrow"
        else if (daysUntil > 1) dueDateText = `In ${daysUntil} days`

        actions.push({
          id: `event-${event.id}`,
          title: `${event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)} scheduled`,
          description: event.notes || `You have a ${event.event_type} scheduled.`,
          dueDate: dueDateText,
          category: "Interviews",
          status: "upcoming" as const,
          priority: daysUntil <= 1 ? ("high" as const) : ("medium" as const),
          jobId: event.job_id,
          actionUrl: `/jobs/${event.job_id}`,
        })
      })
    }

    // Sort actions by priority and due date
    actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      // Sort by due date (overdue first, then today, tomorrow, etc.)
      const dueDateOrder = { Overdue: 5, Today: 4, Tomorrow: 3, "This week": 2 }
      const aDueOrder = dueDateOrder[a.dueDate as keyof typeof dueDateOrder] || 1
      const bDueOrder = dueDateOrder[b.dueDate as keyof typeof dueDateOrder] || 1
      return bDueOrder - aDueOrder
    })

    return NextResponse.json(actions)
  } catch (error) {
    console.error("Error in action plan timeline:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
