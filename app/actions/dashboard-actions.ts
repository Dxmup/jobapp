"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserIdentity } from "@/lib/user-identity"

/**
 * Fetches dashboard statistics for the current user
 * @returns Object containing dashboard statistics or error information
 */
export async function getDashboardStats() {
  try {
    // Get the current user
    const user = await getUserIdentity()

    if (!user) {
      console.log("No authenticated user found in getDashboardStats")
      // Return empty stats instead of throwing an error
      return {
        success: true,
        stats: {
          activeApplications: 0,
          interviewCount: 0,
          resumesCreated: 0,
          coverLetters: 0,
          applicationStreak: 0,
        },
      }
    }

    console.log("User found in getDashboardStats:", user.id)
    const userId = user.id

    // Initialize stats object
    const stats = {
      activeApplications: 0,
      interviewCount: 0,
      resumesCreated: 0,
      coverLetters: 0,
      applicationStreak: 0,
    }

    const supabase = createServerSupabaseClient()

    // Get active applications count and job status data
    const { data: activeJobs, error: activeJobsError } = await supabase
      .from("jobs")
      .select("id, status, updated_at")
      .eq("user_id", userId)

    if (!activeJobsError && activeJobs) {
      // Count active applications (status is 'applied', 'interview', or 'offer')
      stats.activeApplications = activeJobs.filter((job) =>
        ["applied", "interview", "offer"].includes(job.status),
      ).length

      stats.interviewCount = activeJobs.filter((job) => job.status === "interview").length

      // Calculate streak based on days when job status was updated to "applied"
      const appliedJobs = activeJobs.filter((job) => job.status === "applied")

      if (appliedJobs.length > 0) {
        // Get all dates when jobs were marked as applied
        const applicationDates = appliedJobs
          .map((job) => {
            const date = new Date(job.updated_at)
            date.setHours(0, 0, 0, 0) // Normalize to start of day
            return date.toISOString().split("T")[0] // Format as YYYY-MM-DD
          })
          .filter((date, index, self) => self.indexOf(date) === index) // Get unique dates
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort descending

        console.log("Application dates:", applicationDates)

        // Check if there's an application today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString().split("T")[0]

        // Calculate streak
        let streak = 0
        const currentDate = new Date(today)

        // If no application today, start checking from yesterday
        if (!applicationDates.includes(todayStr)) {
          currentDate.setDate(currentDate.getDate() - 1)
        }

        // Check consecutive days backward
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
        console.log("Calculated application streak:", streak)
      }
    } else if (activeJobsError) {
      console.error("Error fetching active jobs:", activeJobsError)
    }

    // Get resumes count
    const { data: resumes, error: resumesError } = await supabase.from("resumes").select("id").eq("user_id", userId)

    if (!resumesError && resumes) {
      stats.resumesCreated = resumes.length
    } else if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
    }

    // Get cover letters count
    const { data: coverLetters, error: coverLettersError } = await supabase
      .from("cover_letters")
      .select("id")
      .eq("user_id", userId)

    if (!coverLettersError && coverLetters) {
      stats.coverLetters = coverLetters.length
    } else if (coverLettersError) {
      console.error("Error fetching cover letters:", coverLettersError)
    }

    console.log("Dashboard stats calculated:", stats)

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
