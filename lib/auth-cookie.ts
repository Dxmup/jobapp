import { cookies } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Centralized cookie-based authentication utility
 * Single source of truth for user authentication across the app
 */

export async function getCurrentUserId(): Promise<string> {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      console.log("No user ID found in cookies, redirecting to login")
      redirect("/login?redirect=" + encodeURIComponent("/dashboard"))
    }

    return userId
  } catch (error) {
    console.error("Error getting current user ID:", error)
    redirect("/login?redirect=" + encodeURIComponent("/dashboard"))
  }
}

export async function getCurrentUserIdOptional(): Promise<string | null> {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value
    return userId || null
  } catch (error) {
    console.error("Error getting current user ID:", error)
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const authenticated = cookieStore.get("authenticated")?.value === "true"
    const userId = cookieStore.get("user_id")?.value
    return authenticated && !!userId
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

export async function hasBaselineResume(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    return cookieStore.get("has_baseline_resume")?.value === "true"
  } catch (error) {
    console.error("Error checking baseline resume:", error)
    return false
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    return cookieStore.get("is_admin")?.value === "true"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
