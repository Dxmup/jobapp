"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ensureUserExists } from "@/lib/ensure-user"
import { cookies } from "next/headers"

/**
 * Server action to create a new job
 * This function handles both authentication methods (Supabase session and cookie)
 *
 * @param formData Object containing job details
 * @returns Object with success status, data if successful, and error message if failed
 */
export async function createJobAction(formData: {
  title: string
  company: string
  location?: string
  description?: string
  url?: string
}) {
  const { title, company, location, description, url } = formData

  if (!title || !company) {
    throw new Error("Missing required fields")
  }

  // Log authentication state for debugging
  const cookieStore = cookies()
  const cookieUserId = cookieStore.get("user_id")?.value
  console.log("Create job - Cookie user_id:", cookieUserId)

  // First ensure the user exists in the database
  const { success, userId, error } = await ensureUserExists()

  if (!success || !userId) {
    console.error("Failed to ensure user exists:", error)
    throw new Error(error || "Failed to verify user")
  }

  console.log("Creating job for user ID:", userId)

  // Get the server-side Supabase client
  const supabase = createServerSupabaseClient()

  try {
    // Insert the job with the verified user ID
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        user_id: userId,
        title,
        company,
        location: location || null,
        description: description || null,
        url: url || null,
        status: "saved",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    console.log("Job created successfully:", data.id)

    // Revalidate the jobs page
    revalidatePath("/dashboard/jobs")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating job:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create job",
    }
  }
}
