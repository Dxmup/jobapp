"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function createCoverLetter(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const jobId = formData.get("jobId") as string

  if (!title || !content) {
    throw new Error("Title and content are required")
  }

  const { data, error } = await supabase
    .from("cover_letters")
    .insert({
      title,
      content,
      job_id: jobId,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating cover letter:", error)
    throw new Error("Failed to create cover letter")
  }

  revalidatePath("/dashboard/cover-letters")
  return data
}

export async function getCoverLetter(id: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase.from("cover_letters").select("*").eq("id", id).eq("user_id", user.id).single()

  if (error) {
    console.error("Error fetching cover letter:", error)
    throw new Error("Cover letter not found")
  }

  return data
}

export async function getCoverLetterById(id: string) {
  return getCoverLetter(id)
}

export async function updateCoverLetter(id: string, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title || !content) {
    throw new Error("Title and content are required")
  }

  const { data, error } = await supabase
    .from("cover_letters")
    .update({
      title,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating cover letter:", error)
    throw new Error("Failed to update cover letter")
  }

  revalidatePath("/dashboard/cover-letters")
  revalidatePath(`/dashboard/cover-letters/${id}`)
  return data
}

export async function deleteCoverLetter(id: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase.from("cover_letters").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting cover letter:", error)
    throw new Error("Failed to delete cover letter")
  }

  revalidatePath("/dashboard/cover-letters")
}

export async function getCoverLetters() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("cover_letters")
    .select(`
      *,
      jobs (
        title,
        company
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching cover letters:", error)
    throw new Error("Failed to fetch cover letters")
  }

  return data || []
}

export async function getJobCoverLetters(jobId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("cover_letters")
    .select("*")
    .eq("job_id", jobId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching job cover letters:", error)
    throw new Error("Failed to fetch cover letters")
  }

  return data || []
}

export async function getUserCoverLetters() {
  return getCoverLetters()
}

export async function saveCoverLetter(formData: FormData) {
  return createCoverLetter(formData)
}

export async function generateCoverLetter(jobId: string, resumeId?: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get job details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .single()

  if (jobError || !job) {
    throw new Error("Job not found")
  }

  // Get resume content if provided
  let resumeContent = ""
  if (resumeId) {
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("content")
      .eq("id", resumeId)
      .eq("user_id", user.id)
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

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 1000,
    })

    return {
      title: `Cover Letter - ${job.title} at ${job.company}`,
      content: text,
      jobId: job.id,
    }
  } catch (error) {
    console.error("Error generating cover letter:", error)
    throw new Error("Failed to generate cover letter")
  }
}

export async function getJobResumes(jobId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get resumes associated with this job
  const { data, error } = await supabase
    .from("job_resumes")
    .select(`
      resumes (
        id,
        name,
        content,
        created_at,
        updated_at
      )
    `)
    .eq("job_id", jobId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error fetching job resumes:", error)
    return []
  }

  return data.map((item) => item.resumes).filter(Boolean)
}
