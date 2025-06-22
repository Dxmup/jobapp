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
        title: data.title,
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
    console.error("Error fetching user resumes:", error)
    throw new Error("Failed to fetch user resumes")
  }
}

export async function associateResumeWithJob(resumeId: string, jobId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
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
    throw new Error("Failed to associate resume with job")
  }
}

export async function getJobResumes(jobId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: jobResumes, error } = await supabase
      .from("job_resumes")
      .select(`
        id,
        resume_id,
        job_id,
        created_at,
        resumes (
          id,
          title,
          content,
          file_url,
          created_at
        )
      `)
      .eq("job_id", jobId)

    if (error) throw error

    return jobResumes || []
  } catch (error) {
    console.error("Error fetching job resumes:", error)
    throw new Error("Failed to fetch job resumes")
  }
}

export async function disassociateResumeFromJob(resumeId: string, jobId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const supabase = createServerSupabaseClient()

  try {
    const { error } = await supabase.from("job_resumes").delete().eq("resume_id", resumeId).eq("job_id", jobId)

    if (error) throw error

    revalidatePath(`/jobs/${jobId}`)
    return { success: true }
  } catch (error) {
    console.error("Error disassociating resume from job:", error)
    throw new Error("Failed to disassociate resume from job")
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
