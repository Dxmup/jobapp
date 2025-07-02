"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getJobCoverLetters(jobId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: coverLetters, error } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching job cover letters:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: coverLetters || [] }
  } catch (error) {
    console.error("Error in getJobCoverLetters:", error)
    return { success: false, error: "Failed to fetch cover letters", data: [] }
  }
}

export async function getUserCoverLetters(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: coverLetters, error } = await supabase
      .from("cover_letters")
      .select(`
        *,
        jobs (
          id,
          title,
          company
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user cover letters:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: coverLetters || [] }
  } catch (error) {
    console.error("Error in getUserCoverLetters:", error)
    return { success: false, error: "Failed to fetch cover letters", data: [] }
  }
}

export async function createCoverLetter(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const jobId = formData.get("jobId") as string
    const userId = formData.get("userId") as string

    if (!title || !content || !jobId || !userId) {
      return { success: false, error: "Missing required fields" }
    }

    const { data, error } = await supabase
      .from("cover_letters")
      .insert({
        title,
        content,
        job_id: jobId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating cover letter:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/cover-letters")
    return { success: true, data }
  } catch (error) {
    console.error("Error in createCoverLetter:", error)
    return { success: false, error: "Failed to create cover letter" }
  }
}

export async function updateCoverLetter(id: string, formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    const title = formData.get("title") as string
    const content = formData.get("content") as string

    if (!title || !content) {
      return { success: false, error: "Missing required fields" }
    }

    const { data, error } = await supabase
      .from("cover_letters")
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating cover letter:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/cover-letters")
    return { success: true, data }
  } catch (error) {
    console.error("Error in updateCoverLetter:", error)
    return { success: false, error: "Failed to update cover letter" }
  }
}

export async function deleteCoverLetter(id: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("cover_letters").delete().eq("id", id)

    if (error) {
      console.error("Error deleting cover letter:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/cover-letters")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteCoverLetter:", error)
    return { success: false, error: "Failed to delete cover letter" }
  }
}

export async function generateCoverLetter(jobId: string, resumeId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Get job details
    const { data: job, error: jobError } = await supabase.from("jobs").select("*").eq("id", jobId).single()

    if (jobError || !job) {
      return { success: false, error: "Job not found" }
    }

    // Get resume details
    const { data: resume, error: resumeError } = await supabase.from("resumes").select("*").eq("id", resumeId).single()

    if (resumeError || !resume) {
      return { success: false, error: "Resume not found" }
    }

    // Here you would integrate with your AI service to generate the cover letter
    // For now, we'll create a basic template
    const generatedContent = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background and experience, I believe I would be a valuable addition to your team.

${job.description ? `I am particularly excited about this opportunity because ${job.description.substring(0, 200)}...` : ""}

I look forward to discussing how my skills and experience can contribute to your team's success.

Best regards,
[Your Name]`

    const { data, error } = await supabase
      .from("cover_letters")
      .insert({
        title: `Cover Letter for ${job.title} at ${job.company}`,
        content: generatedContent,
        job_id: jobId,
        user_id: job.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error generating cover letter:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/cover-letters")
    return { success: true, data }
  } catch (error) {
    console.error("Error in generateCoverLetter:", error)
    return { success: false, error: "Failed to generate cover letter" }
  }
}
