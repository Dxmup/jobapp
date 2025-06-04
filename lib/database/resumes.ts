import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

export interface Resume {
  id: string
  userId: string
  name: string
  fileName: string
  fileUrl: string
  content: string
  isAiGenerated: boolean
  createdAt: string
  updatedAt: string
  expiresAt?: string
  jobTitle?: string
  company?: string
}

export async function getResumes(userId: string): Promise<Resume[]> {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching resumes:", error)
    throw new Error("Failed to fetch resumes")
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
    expiresAt: resume.expires_at || undefined,
    jobTitle: resume.job_title || undefined,
    company: resume.company || undefined,
  }))
}

export async function getResumeById(id: string): Promise<Resume | null> {
  const { data, error } = await supabase.from("resumes").select("*").eq("id", id).single()

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
    expiresAt: data.expires_at || undefined,
    jobTitle: data.job_title || undefined,
    company: data.company || undefined,
  }
}

export async function createResume(resume: Omit<Resume, "id" | "createdAt" | "updatedAt">): Promise<Resume> {
  const now = new Date().toISOString()
  const id = uuidv4()

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      id,
      user_id: resume.userId,
      name: resume.name,
      file_name: resume.fileName,
      file_url: resume.fileUrl,
      content: resume.content,
      is_ai_generated: resume.isAiGenerated,
      created_at: now,
      updated_at: now,
      expires_at: resume.expiresAt,
      job_title: resume.jobTitle,
      company: resume.company,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating resume:", error)
    throw new Error("Failed to create resume")
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
    expiresAt: data.expires_at || undefined,
    jobTitle: data.job_title || undefined,
    company: data.company || undefined,
  }
}

export async function updateResume(
  id: string,
  updates: Partial<Omit<Resume, "id" | "userId" | "createdAt" | "updatedAt">>,
): Promise<Resume> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("resumes")
    .update({
      name: updates.name,
      file_name: updates.fileName,
      file_url: updates.fileUrl,
      content: updates.content,
      is_ai_generated: updates.isAiGenerated,
      updated_at: now,
      expires_at: updates.expiresAt,
      job_title: updates.jobTitle,
      company: updates.company,
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
    expiresAt: data.expires_at || undefined,
    jobTitle: data.job_title || undefined,
    company: data.company || undefined,
  }
}

export async function deleteResume(id: string): Promise<void> {
  const { error } = await supabase.from("resumes").delete().eq("id", id)

  if (error) {
    console.error("Error deleting resume:", error)
    throw new Error("Failed to delete resume")
  }
}
