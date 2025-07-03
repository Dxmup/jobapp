"use server"

import { getCurrentUserId } from "@/lib/auth-cookie"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCoverLetter(data: any) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: coverLetter, error } = await supabase
      .from("cover_letters")
      .insert({
        user_id: userId,
        job_id: data.jobId,
        name: data.name,
        content: data.content,
        is_ai_generated: data.isAiGenerated || false,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/cover-letters")
    revalidatePath(`/jobs/${data.jobId}`)

    return { success: true, coverLetter }
  } catch (error) {
    console.error("Error creating cover letter:", error)
    return { success: false, error: "Failed to create cover letter" }
  }
}

export async function getCoverLetters() {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: coverLetters, error } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data: coverLetters || [] }
  } catch (error) {
    console.error("Error fetching cover letters:", error)
    return { success: false, error: "Failed to fetch cover letters" }
  }
}

export async function getCoverLetter(id: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: coverLetter, error } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error) throw error

    return { success: true, data: coverLetter }
  } catch (error) {
    console.error("Error fetching cover letter:", error)
    return { success: false, error: "Failed to fetch cover letter" }
  }
}

// Add missing export alias
export const getCoverLetterById = getCoverLetter

export async function updateCoverLetter(id: string, data: any) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: coverLetter, error } = await supabase
      .from("cover_letters")
      .update({
        name: data.name,
        content: data.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/cover-letters")
    revalidatePath(`/dashboard/cover-letters/${id}`)

    return { success: true, coverLetter }
  } catch (error) {
    console.error("Error updating cover letter:", error)
    return { success: false, error: "Failed to update cover letter" }
  }
}

export async function deleteCoverLetter(id: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { error } = await supabase.from("cover_letters").delete().eq("id", id).eq("user_id", userId)

    if (error) throw error

    revalidatePath("/dashboard/cover-letters")

    return { success: true, message: "Cover letter deleted successfully!" }
  } catch (error) {
    console.error("Error deleting cover letter:", error)
    return { success: false, error: "Failed to delete cover letter" }
  }
}

export async function getJobCoverLetters(jobId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: coverLetters, error } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("job_id", jobId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, coverLetters: coverLetters || [] }
  } catch (error) {
    console.error("Error fetching job cover letters:", error)
    return { success: false, error: "Failed to fetch cover letters" }
  }
}

export async function getUserCoverLetters() {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: coverLetters, error } = await supabase
      .from("cover_letters")
      .select(`
        *,
        jobs (
          id,
          title,
          company,
          status
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, coverLetters: coverLetters || [] }
  } catch (error) {
    console.error("Error fetching user cover letters:", error)
    return { success: false, error: "Failed to fetch cover letters" }
  }
}

// Add missing generateCoverLetter function
export async function generateCoverLetter(jobData: any, resumeData: any) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Use Gemini AI to generate cover letter
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ai/generate-cover-letter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobTitle: jobData.title,
        company: jobData.company,
        jobDescription: jobData.description,
        resumeContent: resumeData.content,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate cover letter")
    }

    const result = await response.json()
    return { success: true, content: result.coverLetter }
  } catch (error) {
    console.error("Error generating cover letter:", error)
    return { success: false, error: "Failed to generate cover letter" }
  }
}

// Add missing saveCoverLetter function
export const saveCoverLetter = createCoverLetter

// Add missing getJobResumes function
export async function getJobResumes(jobId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: jobResumes, error } = await supabase
      .from("job_resumes")
      .select(`
        *,
        resumes (
          id,
          name,
          content,
          created_at,
          updated_at
        )
      `)
      .eq("job_id", jobId)
      .eq("user_id", userId)

    if (error) throw error

    return { success: true, resumes: jobResumes?.map((jr) => jr.resumes) || [] }
  } catch (error) {
    console.error("Error fetching job resumes:", error)
    return { success: false, error: "Failed to fetch job resumes" }
  }
}
