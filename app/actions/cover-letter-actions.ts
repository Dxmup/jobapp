"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getJobById } from "@/lib/jobs"
import { getResumeById } from "@/lib/resumes"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getAllUserIds } from "@/lib/user-identity"

// Helper function to get the current user ID
async function getCurrentUserId(): Promise<string> {
  const supabase = createServerSupabaseClient()

  // Try to get user from session first
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user?.id) {
    return session.user.id
  }

  // Fallback to cookie
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    // If no user ID is found, redirect to login
    redirect("/login?redirect=" + encodeURIComponent("/dashboard"))
  }

  return userId
}

export async function generateCoverLetter({
  jobId,
  resumeId,
  coverLetterName,
  tone,
  length,
  formality,
  additionalInfo,
}: {
  jobId: string
  resumeId: string
  coverLetterName: string
  tone: number
  length: number
  formality: number
  additionalInfo?: string
}): Promise<{ success: boolean; coverLetter?: string; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    // Get the job details
    const job = await getJobById(jobId)
    if (!job) {
      return { success: false, error: "Job not found" }
    }

    // Verify job belongs to user
    if (job.userId !== userId) {
      return { success: false, error: "You don't have permission to access this job" }
    }

    // Get the resume details
    const resume = await getResumeById(resumeId)
    if (!resume) {
      return { success: false, error: "Resume not found" }
    }

    // Verify resume belongs to user
    if (resume.userId !== userId) {
      return { success: false, error: "You don't have permission to access this resume" }
    }

    // Get user profile information for auto-filling
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, email")
      .eq("id", userId)
      .single()

    // Fallback to auth user email if profile email is not available
    const userEmail = profile?.email || (await supabase.auth.getUser()).data.user?.email || ""
    const userName = profile?.full_name || "Your Name"
    const userPhone = profile?.phone || ""
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return { success: false, error: "Gemini API key is not configured" }
    }

    // Prepare the prompt
    const prompt = `
Please ensure the cover letter meets the following criteria:
Target: Address the Hiring Manager for the position and company specified in the job description. 
Tone: Maintain a professional, confident, and capable tone throughout the letter. Clearly demonstrate relevant skills and strong interest based on qualifications, rather than using overly enthusiastic or "over the top" language. Build trust and engagement.
Content - Alignment: Explicitly connect the applicant's experience, skills, and achievements from the provided resume to the specific responsibilities, requirements, and desired qualifications mentioned in the provided job description. Use language that shows a clear understanding of the target role's demands.
Content - Quantification: Draw relevant quantified results from the resume and highlight them where they directly support claims related to the job description's requirements (e.g., growth percentages, cost savings, efficiency improvements, specific numbers related to scale or volume). Focus on quantifiable achievements that demonstrate impact relevant to the target role.
Structure: Follow a standard professional cover letter format:
Introduction: State the position applying for, where you saw it (optional, can omit if not specified), and a brief sentence highlighting your interest based on alignment with your background.
Body Paragraph(s): Detail key relevant experiences and achievements from the resume, specifically linking them to points in the job description. Use examples with quantified results.
Conclusion: Reiterate interest, briefly summarize your fit, and express eagerness to discuss qualifications further.
Professional Closing: (e.g., "Sincerely," or "Regards,") followed by the applicant's name.
Conciseness: Aim for a length that would typically fit on one page.
Focus on demonstrating a strong, factual match between the applicant's history and the prospective role's needs.

Cover Letter Name: ${coverLetterName}

Job Description:
${job.description}

Resume:
${resume.content}

Additional Information:
${additionalInfo || "None provided"}

Tone (1-10, where 1 is casual and 10 is formal): ${tone}
Length (1-10, where 1 is short and 10 is long): ${length}
Formality (1-10, where 1 is casual and 10 is formal): ${formality}
`

    // Make the API request to Gemini
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generation_config: {
        temperature: 0.7,
        top_p: 0.95,
        top_k: 40,
        max_output_tokens: 8192,
      },
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    )

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gemini API error:", errorData)
      return { success: false, error: `Gemini API error: ${response.status} ${response.statusText}` }
    }

    // Parse the response
    const data = await response.json()

    // Extract the text from the response
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text
    ) {
      const generatedContent = data.candidates[0].content.parts[0].text

      const selectedJob = { company: job.company }

      const finalCoverLetter = `I am excited about the opportunity to bring my skills to ${selectedJob.company} and contribute to your team's success. Thank you for considering my application.

Sincerely,

${userName}
${userPhone ? `${userPhone}` : ""}
${userEmail}

${currentDate}`

      // Auto-replace any remaining common placeholders
      const coverLetterContent = generatedContent
        .replace(/\[Your Name\]/g, userName)
        .replace(/\[Your Phone\]/g, userPhone)
        .replace(/\[Your Email\]/g, userEmail)
        .replace(/\[Date\]/g, currentDate)
        .replace(/\[Today's Date\]/g, currentDate)

      const coverLetter = coverLetterContent

      return { success: true, coverLetter }
    } else {
      console.error("Unexpected response format from Gemini API:", JSON.stringify(data))
      return { success: false, error: "Failed to generate cover letter: Unexpected response format" }
    }
  } catch (error) {
    console.error("Error generating cover letter:", error)
    return {
      success: false,
      error: `Failed to generate cover letter: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function saveCoverLetter({
  jobId,
  name,
  content,
}: {
  jobId: string
  name: string
  content: string
}): Promise<{ success: boolean; coverLetterId?: string; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    // Get the job to verify it exists and belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError || !job) {
      return { success: false, error: "Job not found or access denied" }
    }

    // Insert the cover letter
    const { data, error } = await supabase
      .from("cover_letters")
      .insert({
        user_id: userId,
        job_id: jobId,
        name,
        content,
        is_ai_generated: true, // Set this to true since it's generated by AI
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving cover letter:", error)
      return { success: false, error: "Failed to save cover letter" }
    }

    // Revalidate the job page to show the new cover letter
    revalidatePath(`/jobs/${jobId}`)

    return { success: true, coverLetterId: data.id }
  } catch (error) {
    console.error("Error saving cover letter:", error)
    return {
      success: false,
      error: `Failed to save cover letter: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function getJobResumes(jobId: string): Promise<{ success: boolean; resumes?: any[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user from cookies
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return { success: false, error: "User not authenticated" }
    }

    // Get the job to verify it exists and belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError || !job) {
      return { success: false, error: "Job not found or access denied" }
    }

    // IMPORTANT: We need to check both direct resumes and job_resumes table
    // First, get resumes directly associated with the job
    const { data: directResumes, error: directResumesError } = await supabase
      .from("resumes")
      .select("*")
      .eq("job_id", jobId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (directResumesError) {
      console.error("Error fetching direct job resumes:", directResumesError)
      return { success: false, error: "Failed to fetch direct resumes" }
    }

    // Next, get resume IDs from the job_resumes association table
    const { data: jobResumes, error: jobResumesError } = await supabase
      .from("job_resumes")
      .select("resume_id")
      .eq("job_id", jobId)

    if (jobResumesError) {
      console.error("Error fetching job_resumes associations:", jobResumesError)
      return { success: false, error: "Failed to fetch resume associations" }
    }

    // If there are no associated resumes in the job_resumes table, return just the direct resumes
    if (!jobResumes || jobResumes.length === 0) {
      return { success: true, resumes: directResumes || [] }
    }

    // Get the resume IDs from the job_resumes table
    const resumeIds = jobResumes.map((jr) => jr.resume_id)

    // Fetch the associated resumes
    const { data: associatedResumes, error: associatedResumesError } = await supabase
      .from("resumes")
      .select("*")
      .in("id", resumeIds)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (associatedResumesError) {
      console.error("Error fetching associated resumes:", associatedResumesError)
      return { success: false, error: "Failed to fetch associated resumes" }
    }

    // Combine both sets of resumes and remove duplicates
    const allResumes = [...(directResumes || []), ...(associatedResumes || [])]
    const uniqueResumes = allResumes.filter(
      (resume, index, self) => index === self.findIndex((r) => r.id === resume.id),
    )

    return { success: true, resumes: uniqueResumes }
  } catch (error) {
    console.error("Error fetching job resumes:", error)
    return {
      success: false,
      error: `Failed to fetch resumes: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// New function to get cover letters for a job
export async function getJobCoverLetters(
  jobId: string,
): Promise<{ success: boolean; coverLetters?: any[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    // Get the job to verify it exists and belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError || !job) {
      return { success: false, error: "Job not found or access denied" }
    }

    // Get all cover letters for this job
    const { data: coverLetters, error: coverLettersError } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("job_id", jobId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (coverLettersError) {
      console.error("Error fetching cover letters:", coverLettersError)
      return { success: false, error: "Failed to fetch cover letters" }
    }

    return { success: true, coverLetters }
  } catch (error) {
    console.error("Error fetching cover letters:", error)
    return {
      success: false,
      error: `Failed to fetch cover letters: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// New function to delete a cover letter
export async function deleteCoverLetter(coverLetterId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    // Get the cover letter to verify it exists and belongs to the user
    const { data: coverLetter, error: coverLetterError } = await supabase
      .from("cover_letters")
      .select("job_id")
      .eq("id", coverLetterId)
      .eq("user_id", userId)
      .single()

    if (coverLetterError || !coverLetter) {
      return { success: false, error: "Cover letter not found or access denied" }
    }

    // Delete the cover letter
    const { error: deleteError } = await supabase
      .from("cover_letters")
      .delete()
      .eq("id", coverLetterId)
      .eq("user_id", userId)

    if (deleteError) {
      console.error("Error deleting cover letter:", deleteError)
      return { success: false, error: "Failed to delete cover letter" }
    }

    // Revalidate the job page to show the updated cover letter list
    revalidatePath(`/jobs/${coverLetter.job_id}`)
    revalidatePath(`/dashboard/cover-letters`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting cover letter:", error)
    return {
      success: false,
      error: `Failed to delete cover letter: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// New function to get cover letters for the current user
export async function getUserCoverLetters(): Promise<{ success: boolean; coverLetters?: any[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Get all possible user IDs for the current user
    const userIds = await getAllUserIds()

    if (userIds.length === 0) {
      return { success: false, error: "User not authenticated" }
    }

    console.log(`Fetching cover letters for user IDs: ${userIds.join(", ")}`)

    // Get all cover letters for any of the user IDs
    const { data: coverLetters, error: coverLettersError } = await supabase
      .from("cover_letters")
      .select(`
        *,
        jobs:job_id (
          id,
          title,
          company
        )
      `)
      .in("user_id", userIds)
      .order("created_at", { ascending: false })

    if (coverLettersError) {
      console.error("Error fetching cover letters:", coverLettersError)
      return { success: false, error: "Failed to fetch cover letters" }
    }

    return { success: true, coverLetters }
  } catch (error) {
    console.error("Error fetching cover letters:", error)
    return {
      success: false,
      error: `Failed to fetch cover letters: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// New function to get a cover letter by ID
export async function getCoverLetterById(id: string): Promise<{ success: boolean; coverLetter?: any; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    // Get the cover letter with job details
    const { data: coverLetter, error: coverLetterError } = await supabase
      .from("cover_letters")
      .select(`
        *,
        jobs:job_id (
          id,
          title,
          company
        )
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (coverLetterError) {
      console.error("Error fetching cover letter:", coverLetterError)
      return { success: false, error: "Cover letter not found or access denied" }
    }

    return { success: true, coverLetter }
  } catch (error) {
    console.error("Error fetching cover letter:", error)
    return {
      success: false,
      error: `Failed to fetch cover letter: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// New function to update a cover letter
export async function updateCoverLetter({
  id,
  name,
  content,
}: {
  id: string
  name: string
  content: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    // Get the cover letter to verify it exists and belongs to the user
    const { data: coverLetter, error: coverLetterError } = await supabase
      .from("cover_letters")
      .select("job_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (coverLetterError || !coverLetter) {
      return { success: false, error: "Cover letter not found or access denied" }
    }

    // Update the cover letter
    const { error: updateError } = await supabase
      .from("cover_letters")
      .update({
        name,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating cover letter:", updateError)
      return { success: false, error: "Failed to update cover letter" }
    }

    // Revalidate the job page and cover letters page
    revalidatePath(`/jobs/${coverLetter.job_id}`)
    revalidatePath(`/dashboard/cover-letters`)
    revalidatePath(`/dashboard/cover-letters/${id}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating cover letter:", error)
    return {
      success: false,
      error: `Failed to update cover letter: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
