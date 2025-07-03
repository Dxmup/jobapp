"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUserId } from "@/lib/auth-cookie"

// Simple in-memory cache for request deduplication
const requestCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5000 // 5 seconds

function getCachedResult<T>(key: string): T | null {
  const cached = requestCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }
  requestCache.delete(key) // Clean up expired cache
  return null
}

function setCachedResult<T>(key: string, data: T): void {
  requestCache.set(key, { data, timestamp: Date.now() })
}

// Simplified function to get ONLY the user's first name from user_profiles table
async function getUserFirstName(): Promise<string> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    console.log(`Getting user first name for: ${userId}`)

    // Get user_first_name from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_first_name")
      .eq("user_id", userId)
      .single()

    if (!profileError && profile?.user_first_name) {
      console.log(`Found user first name: ${profile.user_first_name}`)
      return profile.user_first_name
    }

    console.log("No user_first_name found in user_profiles, using default")
    return "the candidate"
  } catch (error) {
    console.error("Error fetching user first name:", error)
    return "the candidate"
  }
}

// Function to get job details including associated resume and cover letter
async function getJobDetailsForInterview(jobId: string, resumeId?: string) {
  const supabase = createServerSupabaseClient()
  const userId = await getCurrentUserId()

  console.log(`Fetching job details for job: ${jobId}, user: ${userId}`)

  // First try with user_id field
  let { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single()

  // If not found, try with userId field (in case field names are inconsistent)
  if (jobError && jobError.message && jobError.message.includes("Results contain 0 rows")) {
    console.log("Job not found with user_id field, trying userId field")
    const { data: altJob, error: altJobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("userId", userId)
      .single()

    if (!altJobError) {
      job = altJob
      jobError = null
    }
  }

  // If still not found, try a direct query without user filtering (for debugging)
  if (jobError) {
    console.log("Job not found with user filtering, checking if job exists at all")
    const { data: anyJob, error: anyJobError } = await supabase
      .from("jobs")
      .select("id, user_id, userId")
      .eq("id", jobId)
      .single()

    if (!anyJobError && anyJob) {
      console.log(`Job exists but belongs to user: ${anyJob.user_id || anyJob.userId}, current user: ${userId}`)
    } else {
      console.log(`Job with ID ${jobId} does not exist in database`)
    }
  }

  if (jobError || !job) {
    console.error("Error fetching job:", jobError)
    return { success: false, error: "Job not found" }
  }

  // Get associated resume (either the specified one or the first one associated with the job)
  let resume = null
  if (resumeId) {
    // If a specific resume ID is provided, fetch that resume
    const { data: resumeData, error: resumeDataError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single()

    if (!resumeDataError && resumeData) {
      resume = resumeData
    } else {
      console.error("Error fetching specified resume:", resumeDataError)

      // Try with userId field if user_id fails
      if (resumeDataError) {
        const { data: altResumeData, error: altResumeDataError } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", resumeId)
          .eq("userId", userId)
          .single()

        if (!altResumeDataError && altResumeData) {
          resume = altResumeData
        }
      }
    }
  } else {
    // Otherwise, get the first resume associated with the job
    const { data: jobResumes, error: resumeError } = await supabase
      .from("job_resumes")
      .select("resume_id")
      .eq("job_id", jobId)

    if (!resumeError && jobResumes && jobResumes.length > 0) {
      const { data: resumeData, error: resumeDataError } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", jobResumes[0].resume_id)
        .eq("user_id", userId) // Ensure the resume belongs to the user
        .single()

      if (!resumeDataError && resumeData) {
        resume = resumeData
      } else if (resumeDataError) {
        // Try with userId field if user_id fails
        const { data: altResumeData, error: altResumeDataError } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", jobResumes[0].resume_id)
          .eq("userId", userId)
          .single()

        if (!altResumeDataError && altResumeData) {
          resume = altResumeData
        }
      }
    }
  }

  // Get associated cover letter
  const { data: coverLetters, error: coverLetterError } = await supabase
    .from("cover_letters")
    .select("*")
    .eq("job_id", jobId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)

  const coverLetter = coverLetters && coverLetters.length > 0 ? coverLetters[0] : null

  return {
    success: true,
    job,
    resume,
    coverLetter,
  }
}

// Function to get resumes associated with a job
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

    // If no resumes are associated with the job, try to get all user resumes
    if (!jobResumes || jobResumes.length === 0) {
      // Try with user_id field first
      let { data: allResumes, error: allResumesError } = await supabase
        .from("resumes")
        .select("id, name, file_name, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      // If no results with user_id, try with userId
      if ((allResumesError || !allResumes || allResumes.length === 0) && userId) {
        const { data: altResumes, error: altResumesError } = await supabase
          .from("resumes")
          .select("id, name, file_name, created_at")
          .eq("userId", userId)
          .order("created_at", { ascending: false })

        if (!altResumesError && altResumes && altResumes.length > 0) {
          allResumes = altResumes
          allResumesError = null
        }
      }

      if (allResumesError) {
        console.error("Error fetching all user resumes:", allResumesError)
        return { success: false, error: "Failed to fetch resumes" }
      }

      return { success: true, resumes: allResumes || [] }
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

// Function to generate interview questions using Gemini
export async function generateInterviewQuestions(
  jobId: string,
  resumeId?: string,
  existingQuestions?: { technical: string[]; behavioral: string[] },
): Promise<{
  success: boolean
  questions?: { technical: string[]; behavioral: string[] }
  error?: string
}> {
  try {
    console.log(`🚀 Generating interview questions for job: ${jobId}, resumeId: ${resumeId || "none"}`)

    // Get user's first name from user_profiles table
    const userFirstName = await getUserFirstName()
    console.log(`👤 Using user first name: ${userFirstName}`)

    // Get job details, resume, and cover letter
    const jobDetails = await getJobDetailsForInterview(jobId, resumeId)

    if (!jobDetails.success) {
      console.error("❌ Failed to get job details:", jobDetails.error)
      return { success: false, error: jobDetails.error || "Failed to fetch job details" }
    }

    const { job, resume, coverLetter } = jobDetails

    console.log(`📋 Job details retrieved: ${job.title} at ${job.company}`)
    console.log(`📄 Resume found: ${resume ? "Yes" : "No"}`)
    console.log(`📝 Cover letter found: ${coverLetter ? "Yes" : "No"}`)

    // Determine if this is a refresh (we have existing questions)
    const isRefresh =
      existingQuestions && (existingQuestions.technical.length > 0 || existingQuestions.behavioral.length > 0)

    console.log(`🔄 Is refresh: ${isRefresh}`)
    if (isRefresh) {
      console.log(
        `📊 Existing questions - Technical: ${existingQuestions.technical.length}, Behavioral: ${existingQuestions.behavioral.length}`,
      )
    }

    // Construct the prompt for Gemini - SIMPLIFIED to only use userFirstName
    let prompt = `You are a headhunter preparing ${userFirstName} for an interview at the job in the job description. 
    Please generate ${isRefresh ? "new" : ""} interview questions based on the job description and resume.
    
    Candidate Name: ${userFirstName}
    Job Title: ${job.title}
    Company: ${job.company}
    Job Description: ${job.description || "Not provided"}
    
    Format your response as a JSON object with two arrays: "technical" for job-specific questions and "behavioral" for general behavioral questions.
    Example format:
    {
      "technical": ["Question 1", "Question 2", ...],
      "behavioral": ["Question 1", "Question 2", ...]
    }
    
    ${
      isRefresh
        ? "Generate 20 NEW technical questions and 5 NEW behavioral questions."
        : "Generate 20 technical questions and 5 behavioral questions."
    }
    ${isRefresh ? "Make these questions more probing, challenging, and in-depth than the previous ones." : ""}
    ${isRefresh ? "DO NOT repeat any of the existing questions listed below." : ""}
    
    IMPORTANT: Make the questions specific to the job description and resume. Reference specific skills, experiences, or technologies mentioned in the resume or job description.
    Address ${userFirstName} by name in the questions where appropriate.
    
    Only return the JSON object, no other text.`

    // Add resume content if available
    if (resume && resume.content) {
      console.log("📄 Adding resume content to prompt")
      prompt += `\n\nResume Content: ${resume.content}`
    } else if (resume && resume.text_content) {
      console.log("📄 Adding resume text_content to prompt")
      prompt += `\n\nResume Content: ${resume.text_content}`
    } else if (resume) {
      console.log("📄 Resume found but no content available")
      // Log available fields for debugging
      console.log("Available resume fields:", Object.keys(resume))
    }

    // Add cover letter content if available
    if (coverLetter && coverLetter.content) {
      console.log("📝 Adding cover letter content to prompt")
      prompt += `\n\nCover Letter Content: ${coverLetter.content}`
    }

    // Add existing questions to avoid repetition
    if (isRefresh) {
      prompt += "\n\nExisting Technical Questions (DO NOT REPEAT THESE):\n"
      existingQuestions.technical.forEach((q, i) => {
        prompt += `${i + 1}. ${q}\n`
      })

      prompt += "\n\nExisting Behavioral Questions (DO NOT REPEAT THESE):\n"
      existingQuestions.behavioral.forEach((q, i) => {
        prompt += `${i + 1}. ${q}\n`
      })

      prompt +=
        "\n\nPlease generate entirely new questions that are more challenging and probe deeper into the candidate's experience and knowledge."
    }

    console.log(`📏 Calling Gemini API with prompt length: ${prompt.length}`)
    console.log(`🔑 API Key available: ${!!process.env.GOOGLE_AI_API_KEY}`)

    // Call Gemini API
    const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent"
    console.log(`🌐 Making API call to: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GOOGLE_AI_API_KEY || "",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: isRefresh ? 0.8 : 0.7, // Higher temperature for refreshed questions to get more variety
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    })

    console.log(`📡 Gemini API response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorData = await response.text()
      console.error("❌ Gemini API error:", errorData)
      return { success: false, error: `Gemini API error: ${response.status} ${response.statusText}` }
    }

    const data = await response.json()
    console.log("✅ Gemini API response received successfully")

    // Extract the text from the response
    const responseText = data.candidates[0].content.parts[0].text
    console.log(`📝 Response text length: ${responseText.length}`)

    // Parse the JSON response
    try {
      // Clean up the response text in case it has markdown code blocks
      const jsonText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()

      console.log("🔍 Parsing JSON response...")
      const questions = JSON.parse(jsonText)

      console.log(
        `✅ Successfully parsed questions: ${questions.technical?.length || 0} technical, ${questions.behavioral?.length || 0} behavioral`,
      )

      return {
        success: true,
        questions: {
          technical: questions.technical || [],
          behavioral: questions.behavioral || [],
        },
      }
    } catch (parseError) {
      console.error("❌ Error parsing Gemini response:", parseError)
      console.log("📄 Raw response:", responseText)
      return { success: false, error: "Failed to parse interview questions" }
    }
  } catch (error) {
    console.error("❌ Error generating interview questions:", error)
    return {
      success: false,
      error: `Failed to generate interview questions: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Function to save interview questions to the database
// Function to save interview questions - SIMPLIFIED to not use storage
export async function saveInterviewQuestions(
  jobId: string,
  questions: { technical: string[]; behavioral: string[] },
  resumeId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Saving questions for job: ${jobId}, resumeId: ${resumeId || "none"}`)
    console.log(`Technical: ${questions.technical.length}, Behavioral: ${questions.behavioral.length}`)

    // For now, just log that we would save the questions
    // This avoids storage issues and simplifies the flow
    console.log(`Questions would be saved (storage disabled for now)`)

    return { success: true }
  } catch (error) {
    console.error("Error in saveInterviewQuestions:", error)
    return {
      success: false,
      error: `Failed to save questions: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Function to get saved interview questions
// Function to get saved interview questions - SIMPLIFIED to not use storage
export async function getInterviewQuestions(
  jobId: string,
  resumeId?: string,
): Promise<{
  success: boolean
  questions?: { technical: string[]; behavioral: string[] }
  error?: string
}> {
  try {
    console.log(`Getting questions for job: ${jobId}, resumeId: ${resumeId || "none"}`)

    // For now, always return empty questions and let the component generate them
    // This avoids storage issues and simplifies the flow
    console.log(`Returning empty questions - will generate on demand`)

    return {
      success: true,
      questions: { technical: [], behavioral: [] },
    }
  } catch (error) {
    console.error("Error in getInterviewQuestions:", error)
    // Always return success with empty questions to allow the app to continue
    return {
      success: true,
      questions: { technical: [], behavioral: [] },
      error: `Error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Add a new function to create the interview_questions table using direct SQL
async function ensureInterviewQuestionsTable(): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  try {
    // First check if the table exists
    const { error: checkError } = await supabase.from("interview_questions").select("id").limit(1)

    // If the table exists, we're done
    if (!checkError) {
      return true
    }

    // Safe error checking - don't assume error.message exists
    const errorMessage = checkError?.message || ""
    const isTableNotExistError = errorMessage.includes("relation") || errorMessage.includes("does not exist")

    if (!isTableNotExistError) {
      console.error("Error checking interview_questions table:", checkError)
      return false
    }

    console.log("Creating interview_questions table...")

    // First, try to create the exec_sql function if it doesn't exist
    try {
      await fetch("/api/admin/create-exec-sql-function", {
        method: "GET",
      })
    } catch (error) {
      console.error("Error creating exec_sql function:", error)
    }

    // Try to create the table using direct SQL query
    try {
      // SQL to create the interview_questions table
      const sql = `
      -- Create interview_questions table if it doesn't exist
      CREATE TABLE IF NOT EXISTS interview_questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_id UUID NOT NULL,
        user_id UUID NOT NULL,
        resume_id UUID,
        technical_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
        behavioral_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Add indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_interview_questions_job_id ON interview_questions(job_id);
      CREATE INDEX IF NOT EXISTS idx_interview_questions_user_id ON interview_questions(user_id);
      CREATE INDEX IF NOT EXISTS idx_interview_questions_resume_id ON interview_questions(resume_id);
      `

      // Execute the SQL directly using query instead of rpc
      const { error: sqlError } = await supabase.query(sql)

      if (sqlError) {
        console.error("Error executing direct SQL:", sqlError)
      } else {
        console.log("Table created successfully via direct SQL query")
        return true
      }
    } catch (sqlError) {
      console.error("Error executing direct SQL query:", sqlError)
    }

    // Try the API routes as fallback
    try {
      // Try the new direct route first
      const response = await fetch("/api/admin/create-interview-questions-table-direct", {
        method: "GET",
      })

      if (response.ok) {
        console.log("Table created successfully via direct API")
        return true
      } else {
        const errorText = await response.text()
        console.error("Direct API error:", errorText)
      }
    } catch (apiError) {
      console.error("Error calling direct API:", apiError)
    }

    // Try the original API route as a last resort
    try {
      const response = await fetch("/api/admin/create-interview-questions-table", {
        method: "GET",
      })

      if (response.ok) {
        console.log("Table created successfully via admin API")
        return true
      } else {
        const errorText = await response.text()
        console.error("Admin API error:", errorText)
      }
    } catch (apiError) {
      console.error("Error calling admin API:", apiError)
    }

    // If we get here, all approaches failed
    console.error("All table creation approaches failed")
    return false
  } catch (error) {
    console.error("Failed to create interview_questions table:", error)
    return false
  }
}

// Function to get all jobs for the current user
export async function getUserJobs(): Promise<{
  success: boolean
  jobs?: any[]
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()
    const cacheKey = `user_jobs_${userId}`

    // Check cache first
    const cached = getCachedResult<{ success: boolean; jobs?: any[]; error?: string }>(cacheKey)
    if (cached) {
      console.log(`Returning cached jobs for user: ${userId}`)
      return cached
    }

    const supabase = createServerSupabaseClient()
    console.log(`Fetching fresh jobs for user: ${userId}`)

    // Try with user_id field first
    let { data, error } = await supabase
      .from("jobs")
      .select("id, title, company, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // If no results or error, try with userId field
    if ((error || !data || data.length === 0) && userId) {
      console.log("No jobs found with user_id field, trying userId field")
      const { data: altData, error: altError } = await supabase
        .from("jobs")
        .select("id, title, company, status")
        .eq("userId", userId)
        .order("created_at", { ascending: false })

      if (!altError && altData && altData.length > 0) {
        data = altData
        error = null
      }
    }

    const result = error ? { success: false, error: "Failed to fetch jobs" } : { success: true, jobs: data || [] }

    // Cache the result
    setCachedResult(cacheKey, result)

    return result
  } catch (error) {
    console.error("Error fetching user jobs:", error)
    return {
      success: false,
      error: `Failed to fetch jobs: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Function to get all resumes for the current user
export async function getUserResumes(): Promise<{
  success: boolean
  resumes?: any[]
  error?: string
}> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    console.log(`Getting all resumes for user: ${userId}`)

    // Try with user_id field first
    let { data, error } = await supabase
      .from("resumes")
      .select("id, name, file_name, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // If no results or error, try with userId field
    if ((error || !data || data.length === 0) && userId) {
      console.log("No resumes found with user_id field, trying userId field")
      const { data: altData, error: altError } = await supabase
        .from("resumes")
        .select("id, name, file_name, created_at")
        .eq("userId", userId)
        .order("created_at", { ascending: false })

      if (!altError && altData && altData.length > 0) {
        data = altData
        error = null
      }
    }

    if (error) {
      console.error("Error fetching user resumes:", error)
      return { success: false, error: "Failed to fetch resumes" }
    }

    return { success: true, resumes: data || [] }
  } catch (error) {
    console.error("Error fetching user resumes:", error)
    return {
      success: false,
      error: `Failed to fetch resumes: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
