import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("Getting dashboard stats for user:", userId)

    const supabase = createServerSupabaseClient()

    // Initialize stats object
    const stats = {
      activeApplications: 0,
      interviewCount: 0,
      resumesCreated: 0,
      coverLetters: 0,
      applicationStreak: 0,
    }

    // Get jobs using the same pattern as /jobs API
    let { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, status, updated_at, applied_at")
      .eq("user_id", userId)

    // If no results or error, try with userId field
    if ((jobsError || !jobs || jobs.length === 0) && userId) {
      console.log("No jobs found with user_id field, trying userId field")
      const { data: altData, error: altError } = await supabase
        .from("jobs")
        .select("id, status, updated_at, applied_at")
        .eq("userId", userId)

      if (!altError && altData && altData.length > 0) {
        jobs = altData
        jobsError = null
      }
    }

    if (!jobsError && jobs) {
      // Count active applications
      stats.activeApplications = jobs.filter((job) => ["applied", "interview", "offer"].includes(job.status)).length

      stats.interviewCount = jobs.filter((job) => job.status === "interview").length

      // Calculate application streak
      const appliedJobs = jobs.filter((job) => job.status === "applied" && job.applied_at)

      if (appliedJobs.length > 0) {
        const applicationDates = appliedJobs
          .map((job) => {
            const date = new Date(job.applied_at)
            date.setHours(0, 0, 0, 0)
            return date.toISOString().split("T")[0]
          })
          .filter((date, index, self) => self.indexOf(date) === index)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

        // Calculate streak
        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString().split("T")[0]
        const currentDate = new Date(today)

        if (!applicationDates.includes(todayStr)) {
          currentDate.setDate(currentDate.getDate() - 1)
        }

        while (true) {
          const dateStr = currentDate.toISOString().split("T")[0]
          if (applicationDates.includes(dateStr)) {
            streak++
            currentDate.setDate(currentDate.getDate() - 1)
          } else {
            break
          }
        }

        stats.applicationStreak = streak
      }
    }

    // Get resumes count
    let { data: resumes, error: resumesError } = await supabase.from("resumes").select("id").eq("user_id", userId)

    if ((resumesError || !resumes || resumes.length === 0) && userId) {
      const { data: altResumes, error: altResumesError } = await supabase
        .from("resumes")
        .select("id")
        .eq("userId", userId)

      if (!altResumesError && altResumes) {
        resumes = altResumes
      }
    }

    if (resumes) {
      stats.resumesCreated = resumes.length
    }

    // Get cover letters count
    let { data: coverLetters, error: coverLettersError } = await supabase
      .from("cover_letters")
      .select("id")
      .eq("user_id", userId)

    if ((coverLettersError || !coverLetters || coverLetters.length === 0) && userId) {
      const { data: altCoverLetters, error: altCoverLettersError } = await supabase
        .from("cover_letters")
        .select("id")
        .eq("userId", userId)

      if (!altCoverLettersError && altCoverLetters) {
        coverLetters = altCoverLetters
      }
    }

    if (coverLetters) {
      stats.coverLetters = coverLetters.length
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
