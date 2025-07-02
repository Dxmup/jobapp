"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUserId } from "@/lib/auth-cookie"
import { revalidatePath } from "next/cache"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function createCoverLetter(data: {
  jobId: string
  name: string
  content: string
  isAiGenerated?: boolean
}) {
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
      .select(`
        *,
        jobs (
          id,
          title,
          company,
          description,
          status
        )
      `)
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

// Alias for getCoverLetter - required by other components
export async function getCoverLetterById(id: string) {
  return getCoverLetter(id)
}

export async function updateCoverLetter(
  id: string,
  data: {
    name: string
    content: string
  },
) {
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

// Alias for createCoverLetter - required by form components
export async function saveCoverLetter(data: {
  jobId: string
  name: string
  content: string
  isAiGenerated?: boolean
}) {
  return createCoverLetter(data)
}

export async function getJobResumes(jobId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = createServerSupabaseClient()

  try {
    // First get resumes associated with this job
    const { data: jobResumes, error: jobResumesError } = await supabase
      .from("job_resumes")
      .select(`
        resume_id,
        resumes (
          id,
          name,
          content,
          file_name,
          created_at,
          updated_at
        )
      `)
      .eq("job_id", jobId)
      .eq("user_id", userId)

    if (jobResumesError) {
      console.error("Error fetching job resumes:", jobResumesError)
      // If no specific job resumes, get all user resumes
      const { data: allResumes, error: allResumesError } = await supabase
        .from("resumes")
        .select("id, name, content, file_name, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (allResumesError) throw allResumesError

      return { success: true, resumes: allResumes || [] }
    }

    // Extract resumes from the job_resumes relationship
    const resumes = jobResumes?.map((jr) => jr.resumes).filter(Boolean) || []

    return { success: true, resumes }
  } catch (error) {
    console.error("Error fetching job resumes:", error)
    return { success: false, error: "Failed to fetch job resumes" }
  }
}

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

    // Generate cover letter using AI
    const prompt = `Generate a professional cover letter for the following job:

Job Title: ${job.title}
Company: ${job.company}
Job Description: ${job.description || "Not provided"}

${resumeContent ? `Based on this resume:\n${resumeContent}` : ""}

Please create a compelling cover letter that:
1. Shows enthusiasm for the role
2. Highlights relevant experience
3. Demonstrates knowledge of the company
4. Is professional and concise
5. Includes a strong opening and closing

Format the cover letter with proper paragraphs and professional structure.`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 1000,
    })

    return {
      success: true,
      content: text,
      jobTitle: job.title,
      company: job.company,
    }
  } catch (error) {
    console.error("Error generating cover letter:", error)
    return { success: false, error: "Failed to generate cover letter" }
  }
}
