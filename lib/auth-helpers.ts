import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createRouteClient } from "@/lib/supabase/authClient"
import { cookies } from "next/headers"

/**
 * Single source of truth for getting authenticated user ID
 * Works in both API routes and server components
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    // Try Supabase session first (most reliable)
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (session?.user?.id && !sessionError) {
      console.log("Auth: Using Supabase session user ID:", session.user.id)
      return session.user.id
    }

    // Fallback to cookie (for edge cases)
    const cookieStore = cookies()
    const cookieUserId = cookieStore.get("user_id")?.value

    if (cookieUserId) {
      console.log("Auth: Using cookie user ID:", cookieUserId)
      return cookieUserId
    }

    console.log("Auth: No authenticated user found")
    return null
  } catch (error) {
    console.error("Error getting authenticated user ID:", error)
    return null
  }
}

/**
 * Single source of truth for getting authenticated user data
 * Returns the user record from our users table
 */
export async function getAuthenticatedUser(): Promise<any | null> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return null
    }

    const supabase = createServerSupabaseClient()
    const { data: user, error } = await supabase.from("users").select("*").eq("auth_id", userId).maybeSingle()

    if (error) {
      console.error("Error fetching user data:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Error getting authenticated user:", error)
    return null
  }
}

/**
 * Throws error if user is not authenticated
 * Use this in API routes that require authentication
 */
export async function requireAuthenticatedUserId(): Promise<string> {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    throw new Error("Authentication required")
  }
  return userId
}

/**
 * For route handlers - uses the route client
 */
export async function getRouteAuthenticatedUserId(): Promise<string | null> {
  try {
    const supabase = createRouteClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (session?.user?.id && !sessionError) {
      console.log("Route Auth: Using session user ID:", session.user.id)
      return session.user.id
    }

    console.log("Route Auth: No authenticated user found")
    return null
  } catch (error) {
    console.error("Error getting route authenticated user ID:", error)
    return null
  }
}

export async function requireRouteAuthenticatedUserId(): Promise<string> {
  const userId = await getRouteAuthenticatedUserId()
  if (!userId) {
    throw new Error("Authentication required")
  }
  return userId
}
