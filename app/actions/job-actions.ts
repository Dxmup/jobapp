"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUserId } from "@/lib/auth-cookie"
import { revalidatePath } from "next/cache"

export async function createJob(data: any) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        user_id: userId,
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description,
        status: data.status || "saved",
        url: data.url,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/jobs")
    revalidatePath("/jobs")

    return {
      success: true,
      job,
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

  const supabase = createServerSupabaseClient()

  try {
    // Verify job belongs to user
    const { data: existingJob, error: fetchError } = await supabase.from("jobs").select("user_id").eq("id", id).single()

    if (fetchError || !existingJob || existingJob.user_id !== userId) {
      return {
        error: "Job not found or unauthorized",
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.title) updateData.title = data.title
    if (data.company) updateData.company = data.company
    if (data.location) updateData.location = data.location
    if (data.description) updateData.description = data.description
    if (data.status) updateData.status = data.status
    if (data.url) updateData.url = data.url

    const { data: job, error } = await supabase.from("jobs").update(updateData).eq("id", id).select().single()

    if (error) throw error

    revalidatePath("/dashboard/jobs")
    revalidatePath(`/jobs/${id}`)

    return {
      success: true,
      job,
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

  const supabase = createServerSupabaseClient()

  try {
    // Verify job belongs to user
    const { data: existingJob, error: fetchError } = await supabase.from("jobs").select("user_id").eq("id", id).single()

    if (fetchError || !existingJob || existingJob.user_id !== userId) {
      return {
        error: "Job not found or unauthorized",
      }
    }

    // Delete associated records first
    await supabase.from("job_resumes").delete().eq("job_id", id)
    await supabase.from("job_events").delete().eq("job_id", id)

    // Delete the job
    const { error } = await supabase.from("jobs").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard/jobs")
    revalidatePath("/jobs")

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

  const supabase = createServerSupabaseClient()

  try {
    const { data: job, error } = await supabase.from("jobs").select("*").eq("id", id).eq("user_id", userId).single()

    if (error) throw error

    return {
      success: true,
      data: job,
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

    if (!userId) {
      return { success: false, error: "Unauthorized" }
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

    const { error } = await supabase.from("jobs").update(updates).eq("id", jobId).eq("user_id", userId)

    if (error) {
      console.error("Error updating job status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/jobs")
    revalidatePath(`/jobs/${jobId}`)

    return { success: true }
  } catch (error) {
    console.error("Error in updateJobStatus:", error)
    return {
      success: false,
      error: "Failed to update job status: " + (error instanceof Error ? error.message : "Unknown error"),
    }
  }
}
