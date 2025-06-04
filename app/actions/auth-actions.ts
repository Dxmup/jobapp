"use server"

import { signIn, signUp, signOut } from "@/lib/auth"
import { cookies } from "next/headers"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  const result = await signIn(email, password)

  if (result.success && result.user) {
    // Set cookies for middleware
    const cookieStore = cookies()

    // Set cookies with appropriate options
    cookieStore.set("authenticated", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })

    // Add null checks before accessing properties
    if (result.user.id) {
      cookieStore.set("user_id", String(result.user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "lax",
      })
    }

    // Add null check for has_baseline_resume
    const hasBaselineResume =
      result.user.has_baseline_resume !== undefined ? String(result.user.has_baseline_resume) : "false"

    cookieStore.set("has_baseline_resume", hasBaselineResume, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })

    console.log("Login successful, cookies set:", {
      authenticated: "true",
      user_id: result.user.id,
      has_baseline_resume: hasBaselineResume,
    })
  }

  return result
}

export async function createUserAndLogin(userData: {
  name: string
  email: string
  password: string
}) {
  try {
    const result = await signUp(userData.email, userData.password, userData.name)

    if (result.success && result.user) {
      // Set cookies for middleware
      const cookieStore = cookies()
      cookieStore.set("authenticated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "lax",
      })

      // Add null check before accessing id
      if (result.user.id) {
        cookieStore.set("user_id", String(result.user.id), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
          sameSite: "lax",
        })
      }

      cookieStore.set("has_baseline_resume", "false", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "lax",
      })

      console.log("Signup successful, cookies set:", {
        authenticated: "true",
        user_id: result.user?.id,
        has_baseline_resume: "false",
      })

      return {
        success: true,
        redirectUrl: "/onboarding",
      }
    }

    // Handle rate limiting specifically
    if (result.isRateLimited) {
      return {
        success: false,
        error: "Too many signup attempts. Please wait a minute before trying again.",
        isRateLimited: true,
      }
    }

    return result
  } catch (error) {
    console.error("Signup error:", error)
    // Check if the error is related to rate limiting
    const errorMessage = error instanceof Error ? error.message : "An error occurred during signup"
    const isRateLimited =
      errorMessage.includes("For security purposes") || errorMessage.includes("you can only request this after")

    return {
      success: false,
      error: isRateLimited
        ? "Too many signup attempts. Please wait a minute before trying again."
        : "An error occurred during signup. Please try again.",
      isRateLimited,
    }
  }
}

export async function logout() {
  const result = await signOut()

  if (result.success) {
    // Clear cookies
    const cookieStore = cookies()
    cookieStore.set("authenticated", "", { maxAge: 0, path: "/" })
    cookieStore.set("user_id", "", { maxAge: 0, path: "/" })
    cookieStore.set("has_baseline_resume", "", { maxAge: 0, path: "/" })

    console.log("Logout successful, cookies cleared")
  }

  return {
    success: result.success,
    error: result.error,
    redirectUrl: "/login",
  }
}
