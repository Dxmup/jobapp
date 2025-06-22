import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUserId } from "@/lib/auth-cookie"

export interface Job {
  id: string
  userId: string
  title: string
  company: string
  location?: string
  description?: string
  status: string
  url?: string
  appliedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateJobData {
  userId: string
  title: string
  company: string
  location?: string
  description?: string
  status?: string
  url?: string
}

export async function getJobs(userId: string): Promise<Job[]> {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (
      data?.map((job) => ({
        id: job.id,
        userId: job.user_id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        status: job.status,
        url: job.url,
        appliedAt: job.applied_at,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      })) || []
    )
  } catch (error) {
    console.error("Error fetching jobs:", error)
    throw new Error("Failed to fetch jobs")
  }
}

export async function getJobById(jobId: string): Promise<Job | null> {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).single()

    if (error) throw error

    if (!data) return null

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      company: data.company,
      location: data.location,
      description: data.description,
      status: data.status,
      url: data.url,
      appliedAt: data.applied_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error("Error fetching job:", error)
    throw new Error("Failed to fetch job")
  }
}

export async function createJob(data: CreateJobData): Promise<Job> {
  const supabase = createServerSupabaseClient()

  try {
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        user_id: data.userId,
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description,
        status: data.status || "saved",
        url: data.url,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: job.id,
      userId: job.user_id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      status: job.status,
      url: job.url,
      appliedAt: job.applied_at,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    }
  } catch (error) {
    console.error("Error creating job:", error)
    throw new Error("Failed to create job")
  }
}

export async function updateJob(jobId: string, updates: Partial<CreateJobData>): Promise<Job> {
  const supabase = createServerSupabaseClient()

  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (updates.title) updateData.title = updates.title
    if (updates.company) updateData.company = updates.company
    if (updates.location) updateData.location = updates.location
    if (updates.description) updateData.description = updates.description
    if (updates.status) updateData.status = updates.status
    if (updates.url) updateData.url = updates.url

    const { data: job, error } = await supabase.from("jobs").update(updateData).eq("id", jobId).select().single()

    if (error) throw error

    return {
      id: job.id,
      userId: job.user_id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      status: job.status,
      url: job.url,
      appliedAt: job.applied_at,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    }
  } catch (error) {
    console.error("Error updating job:", error)
    throw new Error("Failed to update job")
  }
}

export async function deleteJob(jobId: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  try {
    // First delete associated records
    await supabase.from("job_resumes").delete().eq("job_id", jobId)
    await supabase.from("job_events").delete().eq("job_id", jobId)

    // Then delete the job
    const { error } = await supabase.from("jobs").delete().eq("id", jobId)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting job:", error)
    throw new Error("Failed to delete job")
  }
}

export async function createJobEvent(eventData: {
  jobId: string
  eventType: string
  title: string
  description?: string
  date: string
}) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("job_events")
      .insert({
        job_id: eventData.jobId,
        user_id: userId,
        event_type: eventData.eventType,
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.date,
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error creating job event:", error)
    throw new Error("Failed to create job event")
  }
}
