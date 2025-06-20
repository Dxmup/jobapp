"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Helper function to get the current user ID - with improved debugging
async function getCurrentUserId(): Promise<string> {
  try {
    const supabase = createServerSupabaseClient()
    const cookieStore = cookies()

    // Try to get user from session first
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
    }

    if (session?.user?.id) {
      console.log("Using user ID from session:", session.user.id)
      return session.user.id
    }

    // Fallback to cookie
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      console.log("No user ID found, redirecting to login")
      redirect("/login?redirect=" + encodeURIComponent("/dashboard"))
    }

    return userId
  } catch (error) {
    console.error("Error getting current user ID:", error)
    // Try to get from cookie as last resort
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      redirect("/login?redirect=" + encodeURIComponent("/dashboard"))
    }

    return userId
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

    // Construct the prompt for Gemini
    let prompt = `You are a headhunter preparing your client for an interview at the job in the job description. 
    Please generate ${isRefresh ? "new" : ""} interview questions based on the job description and resume.
    
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
export async function saveInterviewQuestions(
  jobId: string,
  questions: { technical: string[]; behavioral: string[] },
  resumeId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    console.log(`Saving questions for job: ${jobId}, user: ${userId}, resumeId: ${resumeId || "none"}`)

    // Store questions in a JSON file in the database
    // This avoids the need for a dedicated table
    const questionData = {
      job_id: jobId,
      user_id: userId,
      resume_id: resumeId || null,
      technical_questions: questions.technical,
      behavioral_questions: questions.behavioral,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Generate a unique key for this set of questions
    const key = `interview_questions/${userId}/${jobId}${resumeId ? `/${resumeId}` : ""}`

    // Ensure the storage bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const userDataBucket = buckets?.find((b) => b.name === "user_data")

      if (!userDataBucket) {
        console.log("Creating user_data bucket")
        await supabase.storage.createBucket("user_data", {
          public: false,
        })
      }
    } catch (bucketError) {
      console.error("Error checking/creating bucket:", bucketError)
    }

    // Store in the storage bucket
    const { error } = await supabase.storage.from("user_data").upload(key, JSON.stringify(questionData), {
      contentType: "application/json",
      upsert: true,
    })

    if (error) {
      console.error("Error storing interview questions:", error)
      return { success: false, error: `Failed to store interview questions: ${error.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving interview questions:", error)
    return {
      success: false,
      error: `Failed to save interview questions: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Function to get saved interview questions
export async function getInterviewQuestions(
  jobId: string,
  resumeId?: string,
): Promise<{
  success: boolean
  questions?: { technical: string[]; behavioral: string[] }
  error?: string
}> {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    console.log(`Getting questions for job: ${jobId}, user: ${userId}, resumeId: ${resumeId || "none"}`)

    // Generate the key for this set of questions
    const key = `interview_questions/${userId}/${jobId}${resumeId ? `/${resumeId}` : ""}`

    // Try to get the questions from storage
    const { data, error } = await supabase.storage.from("user_data").download(key)

    if (error) {
      // If not found, return empty arrays (this is normal for first-time users)
      if (
        error.message?.includes("Not Found") ||
        error.message?.includes("The specified key does not exist") ||
        error.message?.includes("Object not found")
      ) {
        console.log(`No saved questions found for key: ${key} - this is normal for new users`)
        return {
          success: true,
          questions: { technical: [], behavioral: [] },
        }
      }

      // For other errors, log them but still return empty arrays to allow the app to continue
      console.error("Storage error fetching interview questions:", error)
      return {
        success: true,
        questions: { technical: [], behavioral: [] },
        error: `Storage error: ${error.message || "Unknown storage error"}`,
      }
    }

    if (!data) {
      console.log(`No data returned for key: ${key}`)
      return {
        success: true,
        questions: { technical: [], behavioral: [] },
      }
    }

    // Parse the JSON data
    try {
      const text = await data.text()
      const questionData = JSON.parse(text)

      return {
        success: true,
        questions: {
          technical: questionData.technical_questions || [],
          behavioral: questionData.behavioral_questions || [],
        },
      }
    } catch (parseError) {
      console.error("Error parsing question data:", parseError)
      return {
        success: true,
        questions: { technical: [], behavioral: [] },
        error: `Parse error: ${parseError instanceof Error ? parseError.message : "Unknown parse error"}`,
      }
    }
  } catch (error) {
    console.error("Unexpected error fetching interview questions:", error)
    // Always return success: true to allow the app to continue with empty questions
    return {
      success: true,
      questions: { technical: [], behavioral: [] },
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
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
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    // Add rate limiting
    const rateLimit = checkRateLimit(userId, "getUserJobs", 5, 60000) // 5 requests per minute
    if (!rateLimit.success) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`,
      }
    }

    console.log(`Getting all jobs for user: ${userId}`)

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

    if (error) {
      console.error("Error fetching user jobs:", error)
      return { success: false, error: "Failed to fetch jobs" }
    }

    return { success: true, jobs: data || [] }
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

// Define the rate limit check function
interface RateLimitResult {
  success: boolean
  resetTime?: number
}

const rateLimits: { [key: string]: { count: number; lastReset: number } } = {}

function checkRateLimit(
  userId: string,
  actionName: string,
  maxRequests: number,
  resetInterval: number,
): RateLimitResult {
  const key = `${userId}:${actionName}`
  const now = Date.now()

  if (!rateLimits[key]) {
    rateLimits[key] = { count: 1, lastReset: now }
    return { success: true }
  }

  const { count, lastReset } = rateLimits[key]

  if (now - lastReset > resetInterval) {
    rateLimits[key] = { count: 1, lastReset: now }
    return { success: true }
  }

  if (count >= maxRequests) {
    const resetTime = lastReset + resetInterval
    return { success: false, resetTime: resetTime }
  }

  rateLimits[key].count++
  return { success: true }
}
