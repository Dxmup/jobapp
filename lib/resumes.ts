import { createServerSupabaseClient } from "./supabase/server"
import { supabase } from "./supabase/client"
import { v4 as uuidv4 } from "uuid"

export interface Resume {
  id: string
  userId: string
  name: string
  fileName: string
  fileUrl: string | null
  content: string
  isAiGenerated: boolean
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  jobTitle: string | null
  company: string | null
  jobId: string | null
  parentResumeId: string | null
  versionName: string | null
}

export async function getResumes(userId: string, options?: { jobId?: string; isBase?: boolean }): Promise<Resume[]> {
  const serverSupabase = createServerSupabaseClient()

  console.log(`getResumes called for user ${userId} with options:`, options)

  let query = serverSupabase.from("resumes").select("*").eq("user_id", userId).order("created_at", { ascending: false })

  // Filter by job ID if provided
  if (options?.jobId) {
    query = query.eq("job_id", options.jobId)
  }

  // Filter for base resumes (no job ID) if requested
  if (options?.isBase) {
    query = query.is("job_id", null)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching resumes:", error)
    throw new Error("Failed to fetch resumes")
  }

  console.log(`Found ${data.length} resumes for user ${userId}`)

  return data.map((resume) => ({
    id: resume.id,
    userId: resume.user_id,
    name: resume.name,
    fileName: resume.file_name,
    fileUrl: resume.file_url,
    content: resume.content,
    isAiGenerated: resume.is_ai_generated,
    createdAt: resume.created_at,
    updatedAt: resume.updated_at,
    expiresAt: resume.expires_at,
    jobTitle: resume.job_title,
    company: resume.company,
    jobId: resume.job_id,
    parentResumeId: resume.parent_resume_id,
    versionName: resume.version_name,
  }))
}

export async function getResumeById(id: string): Promise<Resume | null> {
  const serverSupabase = createServerSupabaseClient()

  const { data, error } = await serverSupabase.from("resumes").select("*").eq("id", id).single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // Resume not found
    }
    console.error("Error fetching resume:", error)
    throw new Error("Failed to fetch resume")
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    fileName: data.file_name,
    fileUrl: data.file_url,
    content: data.content,
    isAiGenerated: data.is_ai_generated,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    expiresAt: data.expires_at,
    jobTitle: data.job_title,
    company: data.company,
    jobId: data.job_id,
    parentResumeId: data.parent_resume_id,
    versionName: data.version_name,
  }
}

export async function getResumesByJobId(jobId: string): Promise<Resume[]> {
  const serverSupabase = createServerSupabaseClient()

  const { data, error } = await serverSupabase
    .from("resumes")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching resumes for job:", error)
    throw new Error("Failed to fetch resumes for job")
  }

  return data.map((resume) => ({
    id: resume.id,
    userId: resume.user_id,
    name: resume.name,
    fileName: resume.file_name,
    fileUrl: resume.file_url,
    content: resume.content,
    isAiGenerated: resume.is_ai_generated,
    createdAt: resume.created_at,
    updatedAt: resume.updated_at,
    expiresAt: resume.expires_at,
    jobTitle: resume.job_title,
    company: resume.company,
    jobId: resume.job_id,
    parentResumeId: resume.parent_resume_id,
    versionName: resume.version_name,
  }))
}

export async function createResume(resume: {
  userId: string
  name: string
  fileName: string
  fileUrl?: string | null
  content: string
  isAiGenerated?: boolean
  jobTitle?: string | null
  company?: string | null
  jobId?: string | null
  parentResumeId?: string | null
  versionName?: string | null
}): Promise<Resume> {
  const serverSupabase = createServerSupabaseClient()

  const now = new Date().toISOString()

  // Calculate expiry date (30 days from now)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const { data, error } = await serverSupabase
    .from("resumes")
    .insert({
      user_id: resume.userId,
      name: resume.name,
      file_name: resume.fileName,
      file_url: resume.fileUrl || null,
      content: resume.content,
      is_ai_generated: resume.isAiGenerated || false,
      created_at: now,
      updated_at: now,
      expires_at: expiresAt.toISOString(),
      job_title: resume.jobTitle || null,
      company: resume.company || null,
      job_id: resume.jobId || null,
      parent_resume_id: resume.parentResumeId || null,
      version_name: resume.versionName || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating resume:", error)
    throw new Error("Failed to create resume")
  }

  // Update user to indicate they have a baseline resume
  await serverSupabase
    .from("users")
    .update({
      has_baseline_resume: true,
      updated_at: now,
    })
    .eq("id", resume.userId)

  // Also update the cookie
  document.cookie = "has_baseline_resume=true; path=/; max-age=2592000" // 30 days

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    fileName: data.file_name,
    fileUrl: data.file_url,
    content: data.content,
    isAiGenerated: data.is_ai_generated,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    expiresAt: data.expires_at,
    jobTitle: data.job_title,
    company: data.company,
    jobId: data.job_id,
    parentResumeId: data.parent_resume_id,
    versionName: data.version_name,
  }
}

export async function updateResume(
  id: string,
  updates: {
    name?: string
    content?: string
    jobTitle?: string | null
    company?: string | null
    jobId?: string | null
    versionName?: string | null
  },
): Promise<Resume> {
  const serverSupabase = createServerSupabaseClient()

  const now = new Date().toISOString()

  const { data, error } = await serverSupabase
    .from("resumes")
    .update({
      name: updates.name,
      content: updates.content,
      updated_at: now,
      job_title: updates.jobTitle,
      company: updates.company,
      job_id: updates.jobId,
      version_name: updates.versionName,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating resume:", error)
    throw new Error("Failed to update resume")
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    fileName: data.file_name,
    fileUrl: data.file_url,
    content: data.content,
    isAiGenerated: data.is_ai_generated,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    expiresAt: data.expires_at,
    jobTitle: data.job_title,
    company: data.company,
    jobId: data.job_id,
    parentResumeId: data.parent_resume_id,
    versionName: data.version_name,
  }
}

export async function deleteResume(id: string): Promise<void> {
  const serverSupabase = createServerSupabaseClient()

  const { error } = await serverSupabase.from("resumes").delete().eq("id", id)

  if (error) {
    console.error("Error deleting resume:", error)
    throw new Error("Failed to delete resume")
  }
}

export async function uploadResumeFile(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `resumes/${userId}/${fileName}`

  const { error } = await supabase.storage.from("user-files").upload(filePath, file)

  if (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }

  const { data } = supabase.storage.from("user-files").getPublicUrl(filePath)

  return data.publicUrl
}

export async function createResumeForJob(
  baseResumeId: string,
  jobId: string,
  options?: {
    customName?: string
    versionName?: string
    isAiGenerated?: boolean
    modifiedContent?: string
  },
): Promise<Resume> {
  // First, get the base resume
  const baseResume = await getResumeById(baseResumeId)

  if (!baseResume) {
    throw new Error("Base resume not found")
  }

  // Create a new resume with the job ID and parent resume ID
  const serverSupabase = createServerSupabaseClient()

  const now = new Date().toISOString()

  // Calculate expiry date (30 days from now)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  // Get job details for naming
  const { data: job, error: jobError } = await serverSupabase
    .from("jobs")
    .select("title, company")
    .eq("id", jobId)
    .single()

  if (jobError) {
    console.error("Error fetching job details:", jobError)
    throw new Error("Failed to fetch job details")
  }

  // Create a name for the resume if not provided
  const resumeName = options?.customName || `${baseResume.name} for ${job.title} at ${job.company}`

  // Use the provided content or the base resume content
  const content = options?.modifiedContent || baseResume.content

  const { data, error } = await serverSupabase
    .from("resumes")
    .insert({
      user_id: baseResume.userId,
      name: resumeName,
      file_name: baseResume.fileName,
      file_url: baseResume.fileUrl,
      content: content,
      is_ai_generated: options?.isAiGenerated || false,
      created_at: now,
      updated_at: now,
      expires_at: expiresAt.toISOString(),
      job_title: job.title,
      company: job.company,
      job_id: jobId,
      parent_resume_id: baseResumeId,
      version_name: options?.versionName || "Job-specific version",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating resume for job:", error)
    throw new Error("Failed to create resume for job")
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    fileName: data.file_name,
    fileUrl: data.file_url,
    content: data.content,
    isAiGenerated: data.is_ai_generated,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    expiresAt: data.expires_at,
    jobTitle: data.job_title,
    company: data.company,
    jobId: data.job_id,
    parentResumeId: data.parent_resume_id,
    versionName: data.version_name,
  }
}
