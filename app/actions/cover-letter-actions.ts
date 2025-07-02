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

// Missing export: getCoverLetterById (alias for getCoverLetter)
export async function getCoverLetterById(id: string) {
  return getCoverLetter(id)
}

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

// Missing export: generateCoverLetter
export async function generateCoverLetter(jobId: string, resumeId?: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError) throw jobError

    // Get resume if provided
    let resumeContent = ""
    if (resumeId) {
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .select("content")
        .eq("id", resumeId)
        .eq("user_id", userId)
        .single()

      if (!resumeError && resume) {
        resumeContent = resume.content
      }
    }

    // Generate cover letter using AI (placeholder implementation)
    const generatedContent = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. 

${job.description ? `Based on the job description, I believe my skills and experience align well with your requirements.` : ""}

${resumeContent ? "My background and experience, as detailed in my resume, demonstrate my qualifications for this role." : ""}

I would welcome the opportunity to discuss how I can contribute to your team.

Sincerely,
[Your Name]`

    return {
      success: true,
      content: generatedContent,
      jobTitle: job.title,
      company: job.company,
    }
  } catch (error) {
    console.error("Error generating cover letter:", error)
    return { success: false, error: "Failed to generate cover letter" }
  }
}

// Missing export: saveCoverLetter (alias for createCoverLetter)
export async function saveCoverLetter(data: any) {
  return createCoverLetter(data)
}

// Missing export: getJobResumes
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

    return { success: true, resumes: jobResumes || [] }
  } catch (error) {
    console.error("Error fetching job resumes:", error)
    return { success: false, error: "Failed to fetch job resumes" }
  }
}
