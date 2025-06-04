import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserIdentity } from "@/lib/user-identity"

export async function GET() {
  try {
    const user = await getUserIdentity()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const userId = user.id

    // Fetch recent job applications
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, company, status, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5)

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError)
      return NextResponse.json({ error: "Failed to fetch recent activity" }, { status: 500 })
    }

    // Fetch recent resume updates
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("id, name, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(3)

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
    }

    // Fetch recent cover letter updates
    const { data: coverLetters, error: coverLettersError } = await supabase
      .from("cover_letters")
      .select("id, name, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(3)

    if (coverLettersError) {
      console.error("Error fetching cover letters:", coverLettersError)
    }

    // Combine and format all activities
    const activities = []

    // Add job activities
    if (jobs) {
      jobs.forEach((job) => {
        // Check if job was recently created
        if (new Date(job.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
          activities.push({
            id: `job-created-${job.id}`,
            description: `Applied to ${job.title} at ${job.company}`,
            timestamp: job.created_at,
            type: "job_created",
          })
        }

        // Check if job status was recently updated
        if (job.status !== "saved" && new Date(job.updated_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
          activities.push({
            id: `job-updated-${job.id}`,
            description: `Updated ${job.title} status to ${job.status}`,
            timestamp: job.updated_at,
            type: "job_updated",
          })
        }
      })
    }

    // Add resume activities
    if (resumes) {
      resumes.forEach((resume) => {
        activities.push({
          id: `resume-${resume.id}`,
          description: `Updated resume: ${resume.name || "Untitled Resume"}`,
          timestamp: resume.updated_at,
          type: "resume_updated",
        })
      })
    }

    // Add cover letter activities
    if (coverLetters) {
      coverLetters.forEach((letter) => {
        activities.push({
          id: `cover-letter-${letter.id}`,
          description: `Updated cover letter: ${letter.name || "Untitled Cover Letter"}`,
          timestamp: letter.updated_at,
          type: "cover_letter_updated",
        })
      })
    }

    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ activities: activities.slice(0, 5) })
  } catch (error) {
    console.error("Error in recent activity API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
