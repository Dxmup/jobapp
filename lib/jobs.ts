import { createServerSupabaseClient } from "./supabase/server"
import { cookies } from "next/headers"

export interface Job {
  id: string
  userId: string
  title: string
  company: string
  location: string | null
  description: string | null
  status: string
  url: string | null
  createdAt: string
  updatedAt: string
  appliedAt: string | null
}

export interface JobEvent {
  id: string
  jobId: string
  eventType: string
  title: string
  description: string | null
  date: string
  contactName?: string | null
  contactEmail?: string | null
  createdAt: string
  updatedAt: string
}

export async function getJobs(userId: string): Promise<Job[]> {
  const serverSupabase = createServerSupabaseClient()

  console.log(`Getting jobs for user: ${userId}`)

  try {
    // Try with user_id field first
    let { data, error } = await serverSupabase
      .from("jobs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // If no results or error, try with userId field
    if ((error || !data || data.length === 0) && userId) {
      console.log("No jobs found with user_id field, trying userId field")
      const { data: altData, error: altError } = await serverSupabase
        .from("jobs")
        .select("*")
        .eq("userId", userId)
        .order("created_at", { ascending: false })

      if (!altError && altData && altData.length > 0) {
        data = altData
        error = null
      }
    }

    if (error) {
      console.error("Error fetching jobs:", error)
      return []
    }

    return data.map((job) => ({
      id: job.id,
      userId: job.user_id || job.userId,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      status: job.status,
      url: job.url,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      appliedAt: job.applied_at,
    }))
  } catch (error) {
    console.error("Exception fetching jobs:", error)
    return []
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  const serverSupabase = createServerSupabaseClient()

  console.log(`Getting job by ID: ${id}`)

  try {
    // Try with standard query first
    const { data, error } = await serverSupabase.from("jobs").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        console.log("Job not found:", id)
        return null // Job not found
      }
      console.error("Error fetching job:", error)

      // Try a direct query without single() to see if the job exists
      const { data: checkData, error: checkError } = await serverSupabase.from("jobs").select("id").eq("id", id)

      if (!checkError && checkData && checkData.length > 0) {
        console.log(`Job exists but single() failed. Found ${checkData.length} jobs with ID ${id}`)
      } else {
        console.log(`No job found with ID ${id}`)
      }

      return null
    }

    // Get user ID from cookie for ownership verification
    const cookieStore = cookies()
    const cookieUserId = cookieStore.get("user_id")?.value

    // Check if the job belongs to the user
    if (cookieUserId) {
      const jobUserId = data.user_id || data.userId
      if (jobUserId && jobUserId !== cookieUserId) {
        console.log(`Job ownership mismatch: Job belongs to ${jobUserId}, but current user is ${cookieUserId}`)
      }
    }

    return {
      id: data.id,
      userId: data.user_id || data.userId,
      title: data.title,
      company: data.company,
      location: data.location,
      description: data.description,
      status: data.status,
      url: data.url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      appliedAt: data.applied_at,
    }
  } catch (error) {
    console.error("Exception fetching job:", error)

    // Try to get user ID from cookie as fallback
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (userId) {
      console.log("Attempting direct query with user ID from cookie:", userId)
      try {
        // Try with user_id field
        let { data } = await serverSupabase.from("jobs").select("*").eq("id", id).eq("user_id", userId).single()

        if (!data) {
          // Try with userId field
          const { data: altData } = await serverSupabase
            .from("jobs")
            .select("*")
            .eq("id", id)
            .eq("userId", userId)
            .single()

          data = altData
        }

        if (data) {
          return {
            id: data.id,
            userId: data.user_id || data.userId,
            title: data.title,
            company: data.company,
            location: data.location,
            description: data.description,
            status: data.status,
            url: data.url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            appliedAt: data.applied_at,
          }
        }
      } catch (innerError) {
        console.error("Error in fallback job fetch:", innerError)
      }
    }

    return null
  }
}

export async function createJob(job: {
  userId: string
  title: string
  company: string
  location?: string | null
  description?: string | null
  status?: string
  url?: string | null
}): Promise<Job> {
  const serverSupabase = createServerSupabaseClient()

  const now = new Date().toISOString()

  // Determine which field to use for user ID
  const userIdField = "user_id" // We'll standardize on user_id

  try {
    const jobData: any = {
      title: job.title,
      company: job.company,
      location: job.location || null,
      description: job.description || null,
      status: job.status || "saved",
      url: job.url || null,
      created_at: now,
      updated_at: now,
    }

    // Set the user ID field
    jobData[userIdField] = job.userId

    const { data, error } = await serverSupabase.from("jobs").insert(jobData).select().single()

    if (error) {
      console.error("Error creating job:", error)
      throw new Error("Failed to create job")
    }

    return {
      id: data.id,
      userId: data.user_id || data.userId,
      title: data.title,
      company: data.company,
      location: data.location,
      description: data.description,
      status: data.status,
      url: data.url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      appliedAt: data.applied_at,
    }
  } catch (error) {
    console.error("Exception creating job:", error)
    throw new Error("Failed to create job")
  }
}

export async function updateJob(
  id: string,
  updates: {
    title?: string
    company?: string
    location?: string | null
    description?: string | null
    status?: string
    url?: string | null
    appliedAt?: string | null
  },
): Promise<Job> {
  const serverSupabase = createServerSupabaseClient()

  const now = new Date().toISOString()

  try {
    const { data, error } = await serverSupabase
      .from("jobs")
      .update({
        title: updates.title,
        company: updates.company,
        location: updates.location,
        description: updates.description,
        status: updates.status,
        url: updates.url,
        applied_at: updates.appliedAt,
        updated_at: now,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating job:", error)
      throw new Error("Failed to update job")
    }

    return {
      id: data.id,
      userId: data.user_id || data.userId,
      title: data.title,
      company: data.company,
      location: data.location,
      description: data.description,
      status: data.status,
      url: data.url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      appliedAt: data.applied_at,
    }
  } catch (error) {
    console.error("Exception updating job:", error)
    throw new Error("Failed to update job")
  }
}

export async function deleteJob(id: string): Promise<void> {
  const serverSupabase = createServerSupabaseClient()

  try {
    const { error } = await serverSupabase.from("jobs").delete().eq("id", id)

    if (error) {
      console.error("Error deleting job:", error)
      throw new Error("Failed to delete job")
    }
  } catch (error) {
    console.error("Exception deleting job:", error)
    throw new Error("Failed to delete job")
  }
}

export async function getJobEvents(jobId: string): Promise<JobEvent[]> {
  const serverSupabase = createServerSupabaseClient()

  try {
    const { data, error } = await serverSupabase
      .from("job_events")
      .select("*")
      .eq("job_id", jobId)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching job events:", error)
      return []
    }

    return data.map((event) => ({
      id: event.id,
      jobId: event.job_id,
      eventType: event.event_type,
      title: event.title,
      description: event.description,
      date: event.date,
      contactName: event.contact_name,
      contactEmail: event.contact_email,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }))
  } catch (error) {
    console.error("Exception fetching job events:", error)
    return []
  }
}

export async function createJobEvent(event: {
  jobId: string
  eventType: string
  title: string
  description?: string | null
  date: string
  contactName?: string | null
  contactEmail?: string | null
}): Promise<JobEvent> {
  const serverSupabase = createServerSupabaseClient()

  const now = new Date().toISOString()

  try {
    const { data, error } = await serverSupabase
      .from("job_events")
      .insert({
        job_id: event.jobId,
        event_type: event.eventType,
        title: event.title,
        description: event.description || null,
        date: event.date,
        contact_name: event.contactName || null,
        contact_email: event.contactEmail || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating job event:", error)
      throw new Error("Failed to create job event")
    }

    return {
      id: data.id,
      jobId: data.job_id,
      eventType: data.event_type,
      title: data.title,
      description: data.description,
      date: data.date,
      contactName: data.contact_name,
      contactEmail: data.contact_email,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error("Exception creating job event:", error)
    throw new Error("Failed to create job event")
  }
}

export async function deleteJobEvent(id: string): Promise<void> {
  const serverSupabase = createServerSupabaseClient()

  try {
    const { error } = await serverSupabase.from("job_events").delete().eq("id", id)

    if (error) {
      console.error("Error deleting job event:", error)
      throw new Error("Failed to delete job event")
    }
  } catch (error) {
    console.error("Exception deleting job event:", error)
    throw new Error("Failed to delete job event")
  }
}
