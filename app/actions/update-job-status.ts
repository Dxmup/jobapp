"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserIdentity } from "@/lib/user-identity"
import { createJobEvent } from "@/lib/jobs"
import { revalidatePath } from "next/cache"

/**
 * Updates a job's status and creates an event if the status is changed to "applied"
 *
 * @param jobId - The ID of the job to update
 * @param status - The new status for the job
 * @returns Object indicating success or failure
 */
export async function updateJobStatus(jobId: string, status: string) {
  try {
    const user = await getUserIdentity()

    if (!user) {
      console.error("No authenticated user found in updateJobStatus")
      return { success: false, error: "Authentication required" }
    }

    const supabase = createServerSupabaseClient()

    // First, get the current job to check if status is changing
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("status, title, company")
      .eq("id", jobId)
      .single()

    if (jobError) {
      console.error("Error fetching job:", jobError)
      return { success: false, error: "Failed to fetch job details" }
    }

    const now = new Date().toISOString()
    const updates: any = {
      status,
      updated_at: now,
    }

    // If status is changing to "applied", set the applied_at date
    if (status === "applied" && job.status !== "applied") {
      updates.applied_at = now
    }

    // Update the job status
    const { error: updateError } = await supabase.from("jobs").update(updates).eq("id", jobId)

    if (updateError) {
      console.error("Error updating job status:", updateError)
      return { success: false, error: "Failed to update job status" }
    }

    // If status is changing to "applied", create a job event
    if (status === "applied" && job.status !== "applied") {
      try {
        await createJobEvent({
          jobId,
          eventType: "status_change",
          title: `Application submitted for ${job.title} at ${job.company}`,
          description: `Status changed from ${job.status} to applied`,
          date: now,
        })
        console.log("Created job event for status change to applied")
      } catch (eventError) {
        console.error("Error creating job event:", eventError)
        // Continue even if event creation fails
      }
    }

    // Revalidate the jobs page and dashboard
    revalidatePath("/dashboard/jobs")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/analytics")

    return { success: true }
  } catch (error) {
    console.error("Error in updateJobStatus:", error)
    return {
      success: false,
      error: "Failed to update job status: " + (error instanceof Error ? error.message : "Unknown error"),
    }
  }
}
