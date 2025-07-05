// Removed direct import of next/headers to avoid server component issues
import { redirect } from "next/navigation"

/**
 * Authentication Cookie Utilities
 *
 * This module provides utilities for working with authentication cookies.
 * Note: Functions that use cookies() must be called from Server Components or Server Actions only.
 */

/**
 * Gets the current user ID from cookies (Server Components only)
 * This function should only be called from Server Components or API routes
 */
export async function getCurrentUserIdFromCookies(): Promise<string | null> {
  try {
    // Dynamic import to avoid build issues
    const { cookies } = await import("next/headers")
    const cookieStore = cookies()
    return cookieStore.get("user_id")?.value || null
  } catch (error) {
    console.error("Error getting user ID from cookies:", error)
    return null
  }
}

/**
 * Checks if user is authenticated based on cookies (Server Components only)
 */
export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = cookies()
    const authenticated = cookieStore.get("authenticated")?.value
    return authenticated === "true"
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

/**
 * Gets user's baseline resume status from cookies (Server Components only)
 */
export async function getUserBaselineResumeStatus(): Promise<boolean> {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = cookies()
    const hasBaselineResume = cookieStore.get("has_baseline_resume")?.value
    return hasBaselineResume === "true"
  } catch (error) {
    console.error("Error getting baseline resume status:", error)
    return false
  }
}

/**
 * Redirects to login if user is not authenticated
 * This should only be called from Server Components
 */
export async function requireAuth(): Promise<void> {
  const isAuth = await isUserAuthenticated()
  if (!isAuth) {
    redirect("/login")
  }
}

/**
 * Gets all auth-related cookie values (Server Components only)
 */
export async function getAuthCookies(): Promise<{
  userId: string | null
  authenticated: boolean
  hasBaselineResume: boolean
}> {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = cookies()

    return {
      userId: cookieStore.get("user_id")?.value || null,
      authenticated: cookieStore.get("authenticated")?.value === "true",
      hasBaselineResume: cookieStore.get("has_baseline_resume")?.value === "true",
    }
  } catch (error) {
    console.error("Error getting auth cookies:", error)
    return {
      userId: null,
      authenticated: false,
      hasBaselineResume: false,
    }
  }
}

// Client-side utilities (for use in Client Components)
export const clientAuthUtils = {
  /**
   * Check authentication status client-side by making an API call
   */
  async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/check")
      return response.ok
    } catch {
      return false
    }
  },

  /**
   * Get current user data client-side
   */
  async getCurrentUser(): Promise<any> {
    try {
      const response = await fetch("/api/auth/user")
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch {
      return null
    }
  },
}
