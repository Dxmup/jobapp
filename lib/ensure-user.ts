import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * Ensures that the authenticated user exists in the database
 * If the user doesn't exist in the users table, it creates a new record
 *
 * This function checks both Supabase auth session and user_id cookie
 * to handle different authentication methods used in the application.
 *
 * @returns An object with success status, userId if successful, and error message if failed
 */
export async function ensureUserExists() {
  const supabase = createServerSupabaseClient()
  const cookieStore = cookies()
  const cookieUserId = cookieStore.get("user_id")?.value

  // First try to get the authenticated user from the server session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Use either the session user ID or the cookie user ID
  const userId = session?.user?.id || cookieUserId
  const userEmail = session?.user?.email

  console.log("Auth check - Cookie user_id:", cookieUserId)
  console.log("Auth check - Supabase session user:", session?.user?.id)
  console.log("Auth check - Using user ID:", userId)

  if (!userId) {
    console.error("No user ID found in session or cookies")
    return { success: false, error: "No authenticated user found" }
  }

  try {
    // Check if the user exists in the users table
    const { data: userData, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      console.log("User not found in users table, creating record")

      // If we don't have an email but have a userId, try to fetch the user's email
      let emailToUse = userEmail
      if (!emailToUse && userId) {
        const { data: userRecord } = await supabase.from("users").select("email").eq("auth_id", userId).single()
        emailToUse = userRecord?.email || `user-${userId}@example.com`
      }

      // Create a user record if it doesn't exist
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email: emailToUse,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating user record:", insertError)
        return { success: false, error: "Failed to create user record" }
      }
    }

    return { success: true, userId }
  } catch (error) {
    console.error("Error ensuring user exists:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error ensuring user exists",
    }
  }
}
