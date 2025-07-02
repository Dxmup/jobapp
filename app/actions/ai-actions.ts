"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function customizeResumeWithAI(resumeId: string, jobDescription: string, customizations?: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the original resume
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single()

  if (resumeError || !resume) {
    throw new Error("Resume not found")
  }

  const prompt = `You are an expert resume writer. Please customize this resume for the following job description:

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${resume.content}

${customizations ? `SPECIFIC CUSTOMIZATIONS REQUESTED:\n${customizations}` : ""}

Please customize the resume to:
1. Highlight relevant skills and experience for this specific job
2. Use keywords from the job description naturally
3. Reorder sections to emphasize the most relevant qualifications
4. Adjust the professional summary to align with the role
5. Quantify achievements where possible
6. Maintain the original format and structure
7. Keep all factual information accurate

Return only the customized resume content without any additional commentary.`

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 2000,
    })

    // Create a new customized resume
    const { data: customizedResume, error: createError } = await supabase
      .from("resumes")
      .insert({
        name: `${resume.name} (Customized)`,
        content: text,
        user_id: user.id,
        original_resume_id: resumeId,
      })
      .select()
      .single()

    if (createError) {
      throw new Error("Failed to save customized resume")
    }

    revalidatePath("/dashboard/resumes")
    return customizedResume
  } catch (error) {
    console.error("Error customizing resume:", error)
    throw new Error("Failed to customize resume with AI")
  }
}

export async function reviseResumeWithAI(resumeId: string, feedback: string, focusAreas?: string[]) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the current resume
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single()

  if (resumeError || !resume) {
    throw new Error("Resume not found")
  }

  const focusAreasText = focusAreas && focusAreas.length > 0 ? `\nFOCUS AREAS: ${focusAreas.join(", ")}` : ""

  const prompt = `You are an expert resume writer and career coach. Please revise this resume based on the feedback provided:

CURRENT RESUME:
${resume.content}

FEEDBACK TO ADDRESS:
${feedback}${focusAreasText}

Please revise the resume to:
1. Address all the feedback points specifically
2. Improve clarity and impact of bullet points
3. Enhance the professional summary
4. Strengthen achievement statements with metrics where possible
5. Improve keyword optimization for ATS systems
6. Ensure consistent formatting and professional presentation
7. Maintain factual accuracy while improving presentation

Return only the revised resume content without any additional commentary.`

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 2000,
    })

    // Update the existing resume
    const { data: revisedResume, error: updateError } = await supabase
      .from("resumes")
      .update({
        content: text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      throw new Error("Failed to save revised resume")
    }

    revalidatePath("/dashboard/resumes")
    revalidatePath(`/dashboard/resumes/view/${resumeId}`)
    return revisedResume
  } catch (error) {
    console.error("Error revising resume:", error)
    throw new Error("Failed to revise resume with AI")
  }
}

export async function generateResumeFromScratch(
  jobDescription: string,
  userInfo: {
    name: string
    email: string
    phone?: string
    location?: string
    experience: string
    skills: string
    education: string
  },
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const prompt = `You are an expert resume writer. Create a professional resume for the following job and candidate information:

JOB DESCRIPTION:
${jobDescription}

CANDIDATE INFORMATION:
Name: ${userInfo.name}
Email: ${userInfo.email}
Phone: ${userInfo.phone || "Not provided"}
Location: ${userInfo.location || "Not provided"}

Experience: ${userInfo.experience}
Skills: ${userInfo.skills}
Education: ${userInfo.education}

Please create a professional resume that:
1. Uses a clean, ATS-friendly format
2. Includes a compelling professional summary
3. Highlights relevant experience with quantified achievements
4. Lists technical and soft skills relevant to the job
5. Presents education appropriately
6. Uses action verbs and industry keywords
7. Is tailored specifically for the target job

Format the resume with clear sections and professional presentation.`

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 2000,
    })

    // Create the new resume
    const { data: newResume, error: createError } = await supabase
      .from("resumes")
      .insert({
        name: `AI Generated Resume - ${new Date().toLocaleDateString()}`,
        content: text,
        user_id: user.id,
      })
      .select()
      .single()

    if (createError) {
      throw new Error("Failed to save generated resume")
    }

    revalidatePath("/dashboard/resumes")
    return newResume
  } catch (error) {
    console.error("Error generating resume:", error)
    throw new Error("Failed to generate resume with AI")
  }
}

export async function optimizeResumeForATS(resumeId: string, jobDescription?: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the current resume
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single()

  if (resumeError || !resume) {
    throw new Error("Resume not found")
  }

  const jobContext = jobDescription ? `\nTARGET JOB DESCRIPTION:\n${jobDescription}` : ""

  const prompt = `You are an ATS (Applicant Tracking System) optimization expert. Please optimize this resume for better ATS compatibility and keyword matching:

CURRENT RESUME:
${resume.content}${jobContext}

Please optimize the resume to:
1. Use standard section headings (Experience, Education, Skills, etc.)
2. Include relevant keywords naturally throughout
3. Use simple, clean formatting without complex layouts
4. Ensure consistent date formats
5. Use standard job titles and industry terminology
6. Include both acronyms and full terms (e.g., "AI (Artificial Intelligence)")
7. Optimize bullet points with action verbs and quantified results
8. Remove any formatting that might confuse ATS systems

Return only the ATS-optimized resume content without any additional commentary.`

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 2000,
    })

    // Create an ATS-optimized version
    const { data: optimizedResume, error: createError } = await supabase
      .from("resumes")
      .insert({
        name: `${resume.name} (ATS Optimized)`,
        content: text,
        user_id: user.id,
        original_resume_id: resumeId,
      })
      .select()
      .single()

    if (createError) {
      throw new Error("Failed to save ATS-optimized resume")
    }

    revalidatePath("/dashboard/resumes")
    return optimizedResume
  } catch (error) {
    console.error("Error optimizing resume for ATS:", error)
    throw new Error("Failed to optimize resume for ATS")
  }
}
