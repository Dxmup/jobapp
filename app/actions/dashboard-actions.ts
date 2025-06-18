"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * Fetches dashboard statistics for the current user
 * @returns Object containing dashboard statistics or error information
 */
export async function getDashboardStats() {
  try {
    // Use the same authentication pattern as /jobs API
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      console.log("No user_id cookie found in getDashboardStats")
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

    console.log("User ID from cookie in getDashboardStats:", userId)

    // Initialize stats object
    const stats = {
      activeApplications: 0,
      interviewCount: 0,
      resumesCreated: 0,
      coverLetters: 0,
      applicationStreak: 0,
    }

    const supabase = createServerSupabaseClient()

    // Get active applications count and job status data using the same pattern as /jobs API
    // Try with user_id field first, then userId field as fallback
    let { data: activeJobs, error: activeJobsError } = await supabase
      .from("jobs")
      .select("id, status, updated_at, applied_at")
      .eq("user_id", userId)

    // If no results or error, try with userId field
    if ((activeJobsError || !activeJobs || activeJobs.length === 0) && userId) {
      console.log("No jobs found with user_id field, trying userId field")
      const { data: altData, error: altError } = await supabase
        .from("jobs")
        .select("id, status, updated_at, applied_at")
        .eq("userId", userId)

      if (!altError && altData && altData.length > 0) {
        activeJobs = altData
        activeJobsError = null
      }
    }

    if (!activeJobsError && activeJobs) {
      // Count active applications (status is 'applied', 'interview', or 'offer')
      stats.activeApplications = activeJobs.filter((job) =>
        ["applied", "interview", "offer"].includes(job.status),
      ).length

      stats.interviewCount = activeJobs.filter((job) => job.status === "interview").length

      // Calculate streak based on days when jobs were applied to
      const appliedJobs = activeJobs.filter((job) => job.status === "applied" && job.applied_at)

      if (appliedJobs.length > 0) {
        // Get all dates when jobs were applied to
        const applicationDates = appliedJobs
          .map((job) => {
            const date = new Date(job.applied_at)
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

    // Get resumes count using the same dual-field approach
    let { data: resumes, error: resumesError } = await supabase.from("resumes").select("id").eq("user_id", userId)

    // Try userId field if user_id didn't work
    if ((resumesError || !resumes || resumes.length === 0) && userId) {
      const { data: altResumes, error: altResumesError } = await supabase
        .from("resumes")
        .select("id")
        .eq("userId", userId)

      if (!altResumesError && altResumes) {
        resumes = altResumes
        resumesError = null
      }
    }

    if (!resumesError && resumes) {
      stats.resumesCreated = resumes.length
    } else if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
    }

    // Get cover letters count using the same dual-field approach
    let { data: coverLetters, error: coverLettersError } = await supabase
      .from("cover_letters")
      .select("id")
      .eq("user_id", userId)

    // Try userId field if user_id didn't work
    if ((coverLettersError || !coverLetters || coverLetters.length === 0) && userId) {
      const { data: altCoverLetters, error: altCoverLettersError } = await supabase
        .from("cover_letters")
        .select("id")
        .eq("userId", userId)

      if (!altCoverLettersError && altCoverLetters) {
        coverLetters = altCoverLetters
        coverLettersError = null
      }
    }

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
