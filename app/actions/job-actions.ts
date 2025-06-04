import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserIdentity } from "@/app/utils"

export async function updateJobStatus(jobId: string, status: string) {
  try {
    const user = await getUserIdentity()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

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

    const { error } = await supabase.from("jobs").update(updates).eq("id", jobId).eq("user_id", user.id)

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
