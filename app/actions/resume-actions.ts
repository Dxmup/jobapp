"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentUserId } from "@/lib/auth-cookie"

export async function addResume(formData: FormData) {
  const supabase = createServerSupabaseClient()

  const resume = {
    title: formData.get("title") as string,
  }

  const { data, error } = await supabase.from("resumes").insert(resume).select()

  if (error) {
    console.log(error)
    return { message: "Error creating resume" }
  }

  revalidatePath("/resumes")
  return { message: "Resume created successfully" }
}

export async function updateResume(id: string, formData: FormData) {
  const supabase = createServerSupabaseClient()

  const resume = {
    title: formData.get("title") as string,
  }

  const { data, error } = await supabase.from("resumes").update(resume).eq("id", id).select()

  if (error) {
    console.log(error)
    return { message: "Error updating resume" }
  }

  revalidatePath("/resumes")
  return { message: "Resume updated successfully" }
}

export async function deleteResume(id: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("resumes").delete().eq("id", id)

  if (error) {
    console.log(error)
    return { message: "Error deleting resume" }
  }

  revalidatePath("/resumes")
  return { message: "Resume deleted successfully" }
}

export async function createResume(data: { title: string; content: string; file_url?: string }) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: resume, error } = await supabase
      .from("resumes")
      .insert({
        name: data.title,
        content: data.content,
        file_url: data.file_url,
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/resumes")
    return { success: true, resume }
  } catch (error) {
    console.error("Error creating resume:", error)
    throw new Error("Failed to create resume")
  }
}

export async function getResumes() {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return resumes || []
  } catch (error) {
    console.error("Error fetching resumes:", error)
    throw new Error("Failed to fetch resumes")
  }
}

export async function getUserResumes() {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, resumes: resumes || [] }
  } catch (error) {
    console.error("Error fetching user resumes:", error)
    return { success: false, error: "Failed to fetch user resumes" }
  }
}

export async function associateResumeWithJob(resumeId: string, jobId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    // Check if association already exists
    const { data: existing } = await supabase
      .from("job_resumes")
      .select("id")
      .eq("resume_id", resumeId)
      .eq("job_id", jobId)
      .single()

    if (existing) {
      return { success: true, message: "Resume already associated with this job" }
    }

    const { data: association, error } = await supabase
      .from("job_resumes")
      .insert({
        resume_id: resumeId,
        job_id: jobId,
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/jobs/${jobId}`)
    return { success: true, association }
  } catch (error) {
    console.error("Error associating resume with job:", error)
    return { success: false, error: "Failed to associate resume with job" }
  }
}

// Use the same pattern as interview-prep-actions.ts
export async function getJobResumes(jobId: string): Promise<{
  success: boolean
  resumes?: any[]
  error?: string
}> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    console.log(`Getting resumes for job: ${jobId}, user: ${userId}`)

    // First, verify the job belongs to the user - try both user_id and userId fields
    let { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    // If not found with user_id, try with userId
    if (jobError && jobError.message && jobError.message.includes("Results contain 0 rows")) {
      const { data: altJob, error: altJobError } = await supabase
        .from("jobs")
        .select("id")
        .eq("id", jobId)
        .eq("userId", userId)
        .single()

      if (!altJobError) {
        job = altJob
        jobError = null
      }
    }

    if (jobError || !job) {
      console.error("Error verifying job ownership:", jobError)
      return { success: false, error: "Job not found or access denied" }
    }

    // Get resume IDs associated with the job
    const { data: jobResumes, error: jobResumesError } = await supabase
      .from("job_resumes")
      .select("resume_id")
      .eq("job_id", jobId)

    if (jobResumesError) {
      console.error("Error fetching job resumes:", jobResumesError)
      return { success: false, error: "Failed to fetch job resumes" }
    }

    // If no resumes are associated with the job, return empty array
    if (!jobResumes || jobResumes.length === 0) {
      console.log(`No resumes associated with job ${jobId}`)
      return { success: true, resumes: [] }
    }

    // Get the actual resume details for associated resumes
    const resumeIds = jobResumes.map((jr) => jr.resume_id)

    // Try with user_id field first
    let { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("id, name, file_name, created_at")
      .in("id", resumeIds)
      .eq("user_id", userId) // Ensure we only get resumes owned by the user

    // If no results with user_id, try with userId
    if ((resumesError || !resumes || resumes.length === 0) && userId) {
      const { data: altResumes, error: altResumesError } = await supabase
        .from("resumes")
        .select("id, name, file_name, created_at")
        .in("id", resumeIds)
        .eq("userId", userId)

      if (!altResumesError && altResumes && altResumes.length > 0) {
        resumes = altResumes
        resumesError = null
      }
    }

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError)
      return { success: false, error: "Failed to fetch resumes" }
    }

    return { success: true, resumes: resumes || [] }
  } catch (error) {
    console.error("Error fetching job resumes:", error)
    return {
      success: false,
      error: `Failed to fetch job resumes: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function disassociateResumeFromJob(resumeId: string, jobId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { error } = await supabase.from("job_resumes").delete().eq("resume_id", resumeId).eq("job_id", jobId)

    if (error) throw error

    revalidatePath(`/jobs/${jobId}`)
    return { success: true }
  } catch (error) {
    console.error("Error disassociating resume from job:", error)
    return { success: false, error: "Failed to disassociate resume from job" }
  }
}

export async function getResumeById(resumeId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single()

    if (error) throw error

    return resume
  } catch (error) {
    console.error("Error fetching resume:", error)
    throw new Error("Failed to fetch resume")
  }
}

export async function removeResumeFromJob(resumeId: string, jobId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { error } = await supabase
      .from("job_resumes")
      .delete()
      .eq("resume_id", resumeId)
      .eq("job_id", jobId)
      .eq("user_id", userId)

    if (error) throw error

    revalidatePath(`/jobs/${jobId}`)
    return { success: true }
  } catch (error) {
    console.error("Error removing resume from job:", error)
    return { success: false, error: "Failed to remove resume from job" }
  }
}
