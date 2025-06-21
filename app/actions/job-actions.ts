import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUserId } from "@/lib/auth-cookie"

export async function createJob(data: any) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  try {
    // Simulate database interaction
    console.log("Creating job with data:", data, "for user:", userId)
    return {
      success: true,
      message: "Job created successfully",
    }
  } catch (error) {
    console.error("Error creating job:", error)
    return {
      error: "Failed to create job",
    }
  }
}

export async function updateJob(id: string, data: any) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  try {
    // Simulate database interaction
    console.log("Updating job with id:", id, "and data:", data, "for user:", userId)
    return {
      success: true,
      message: "Job updated successfully",
    }
  } catch (error) {
    console.error("Error updating job:", error)
    return {
      error: "Failed to update job",
    }
  }
}

export async function deleteJob(id: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  try {
    // Simulate database interaction
    console.log("Deleting job with id:", id, "for user:", userId)
    return {
      success: true,
      message: "Job deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting job:", error)
    return {
      error: "Failed to delete job",
    }
  }
}

export async function getJob(id: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  try {
    // Simulate database interaction
    console.log("Getting job with id:", id, "for user:", userId)
    return {
      success: true,
      data: { id, title: "Sample Job" }, // Replace with actual job data
    }
  } catch (error) {
    console.error("Error getting job:", error)
    return {
      error: "Failed to get job",
    }
  }
}

export async function updateJobStatus(jobId: string, status: string) {
  try {
    const userId = await getCurrentUserId()

    const supabase = createServerSupabaseClient()
    const now = new Date().toISOString()

    const updates: any = {
      status,
      updated_at: now,
    }

    // If status is being set to "applied", also set applied_at
    if (status === "applied") {
      updates.applied_at = now
    }

    const { error } = await supabase.from("jobs").update(updates).eq("id", jobId).eq("user_id", userId)

    if (error) {
      console.error("Error updating job status:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateJobStatus:", error)
    return {
      success: false,
      error: "Failed to update job status: " + (error instanceof Error ? error.message : "Unknown error"),
    }
  }
}
