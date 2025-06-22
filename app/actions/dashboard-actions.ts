import { getCurrentUserId } from "@/lib/auth-cookie"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
  try {
    const userId = await getCurrentUserId()
    console.log("User ID from centralized auth in getDashboardStats:", userId)

    const supabase = createServerSupabaseClient()

    // Get job applications count
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, status, created_at")
      .eq("user_id", userId)

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError)
      throw new Error("Failed to fetch jobs")
    }

    // Get resumes count
    const { data: resumes, error: resumesError } = await supabase.from("resumes").select("id").eq("user_id", userId)

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
      throw new Error("Failed to fetch resumes")
    }

    // Get cover letters count
    const { data: coverLetters, error: coverLettersError } = await supabase
      .from("cover_letters")
      .select("id")
      .eq("user_id", userId)

    if (coverLettersError) {
      console.error("Error fetching cover letters:", coverLettersError)
      throw new Error("Failed to fetch cover letters")
    }

    // Calculate stats
    const activeApplications =
      jobs?.filter((job) => ["applied", "interviewing", "offer"].includes(job.status?.toLowerCase())).length || 0

    const interviewCount = jobs?.filter((job) => job.status?.toLowerCase() === "interviewing").length || 0

    // Calculate application streak (consecutive days with applications)
    const sortedJobs = jobs?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []

    let applicationStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sortedJobs.length; i++) {
      const jobDate = new Date(sortedJobs[i].created_at)
      jobDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((today.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === applicationStreak) {
        applicationStreak++
      } else {
        break
      }
    }

    const stats = {
      activeApplications,
      interviewCount,
      resumesCreated: resumes?.length || 0,
      coverLetters: coverLetters?.length || 0,
      applicationStreak,
    }

    return {
      success: true,
      stats,
    }
  } catch (error) {
    console.error("Error in getDashboardStats:", error)
    return {
      success: false,
      error: "Failed to fetch dashboard stats: " + (error instanceof Error ? error.message : "Unknown error"),
      stats: {
        activeApplications: 0,
        interviewCount: 0,
        resumesCreated: 0,
        coverLetters: 0,
        applicationStreak: 0,
      },
    }
  }
}
