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

    // Get user's data to calculate category progress
    const [jobsResult, resumesResult, coverLettersResult, eventsResult] = await Promise.all([
      supabase.from("jobs").select("id, status").eq("user_id", user.id),
      supabase.from("resumes").select("id").eq("user_id", user.id),
      supabase.from("cover_letters").select("id").eq("user_id", user.id),
      supabase.from("job_events").select("id, event_type").eq("user_id", user.id),
    ])

    const jobs = jobsResult.data || []
    const resumes = resumesResult.data || []
    const coverLetters = coverLettersResult.data || []
    const events = eventsResult.data || []

    // Calculate category progress
    const categories = [
      {
        id: "resume",
        name: "Resume Building",
        progress: resumes.length > 0 ? Math.min(100, resumes.length * 50) : 0,
        color: "bg-blue-500",
        count: {
          completed: resumes.length,
          total: Math.max(2, resumes.length + (resumes.length === 0 ? 1 : 0)),
        },
      },
      {
        id: "applications",
        name: "Job Applications",
        progress:
          jobs.length > 0
            ? Math.min(
                100,
                (jobs.filter((j) => j.status && j.status !== "draft").length / Math.max(jobs.length, 1)) * 100,
              )
            : 0,
        color: "bg-purple-500",
        count: {
          completed: jobs.filter((j) => j.status && j.status !== "draft").length,
          total: Math.max(jobs.length, 1),
        },
      },
      {
        id: "interviews",
        name: "Interview Prep",
        progress: events.length > 0 ? Math.min(100, events.filter((e) => e.event_type === "interview").length * 25) : 0,
        color: "bg-green-500",
        count: {
          completed: events.filter((e) => e.event_type === "interview").length,
          total: Math.max(4, events.filter((e) => e.event_type === "interview").length),
        },
      },
      {
        id: "followups",
        name: "Follow-ups",
        progress:
          jobs.length > 0
            ? Math.min(
                100,
                jobs.filter((j) => j.status === "applied" || j.status === "interview_scheduled").length * 25,
              )
            : 0,
        color: "bg-amber-500",
        count: {
          completed: jobs.filter((j) => j.status === "applied" || j.status === "interview_scheduled").length,
          total: Math.max(4, jobs.length),
        },
      },
      {
        id: "research",
        name: "Company Research",
        progress: coverLetters.length > 0 ? Math.min(100, coverLetters.length * 20) : 0,
        color: "bg-red-500",
        count: {
          completed: coverLetters.length,
          total: Math.max(5, coverLetters.length + (coverLetters.length === 0 ? 1 : 0)),
        },
      },
    ]

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error in action plan categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
