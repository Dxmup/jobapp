import { createServerClient } from "@/lib/supabase/singleton"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getSession() {
  const supabase = createServerClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.user) {
    return null
  }

  try {
    const supabase = createServerClient()
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", session.user.id)
      .maybeSingle()

    if (error) {
      console.error("Error fetching current user:", error)
      return null
    }

    return userData
  } catch (error) {
    console.error("Exception getting current user:", error)
    return null
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = createServerClient()

    console.log("Starting sign in process for:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase auth error:", error)
      return { success: false, error: error.message }
    }

    if (!data.user || !data.session) {
      console.error("No user or session data returned")
      return { success: false, error: "Authentication failed - no session created" }
    }

    console.log("Auth successful for user:", data.user.id)
    console.log("Session created:", !!data.session)

    // Set authentication cookies immediately
    const cookieStore = cookies()

    // Set session cookies that middleware can read
    cookieStore.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: data.session.expires_in,
      path: "/",
      sameSite: "lax",
    })

    cookieStore.set("sb-refresh-token", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    })

    cookieStore.set("authenticated", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: data.session.expires_in,
      path: "/",
      sameSite: "lax",
    })

    cookieStore.set("user_id", data.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: data.session.expires_in,
      path: "/",
      sameSite: "lax",
    })

    // Try to fetch user data from our users table
    let userData = null
    try {
      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", data.user.id)
        .maybeSingle()

      if (userError) {
        console.error("Error fetching user data:", userError)
      } else {
        userData = userRecord
      }
    } catch (fetchError) {
      console.error("Exception fetching user data:", fetchError)
    }

    // If no user record exists, create one using admin client
    if (!userData) {
      console.log("No user record found, creating one...")
      try {
        const adminSupabase = createServerSupabaseClient()
        const { data: newUserData, error: createError } = await adminSupabase
          .from("users")
          .insert({
            auth_id: data.user.id,
            email: data.user.email?.toLowerCase(),
            name:
              data.user.user_metadata?.name ||
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "User",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            has_baseline_resume: false,
            is_active: true,
          })
          .select()
          .single()

        if (createError) {
          console.error("Error creating user record:", createError)
          // Continue with minimal user data
          userData = {
            id: data.user.id,
            auth_id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || "User",
            has_baseline_resume: false,
          }
        } else {
          userData = newUserData
          console.log("User record created successfully:", userData.id)
        }
      } catch (createException) {
        console.error("Exception creating user record:", createException)
        // Continue with minimal user data
        userData = {
          id: data.user.id,
          auth_id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || "User",
          has_baseline_resume: false,
        }
      }
    }

    // Set additional cookies based on user data
    if (userData) {
      cookieStore.set("has_baseline_resume", String(userData.has_baseline_resume || false), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: data.session.expires_in,
        path: "/",
        sameSite: "lax",
      })

      // Check if user is admin
      const adminEmails = [
        "admin@careerai.com",
        "test@admin.com",
        "admin@test.com",
        "testing@careerai.com",
        "mctesterson@careerai.com",
        process.env.ADMIN_EMAIL,
      ]
        .filter(Boolean)
        .map((email) => email.toLowerCase())

      const isAdmin = adminEmails.includes(userData.email?.toLowerCase() || "")

      cookieStore.set("is_admin", String(isAdmin), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: data.session.expires_in,
        path: "/",
        sameSite: "lax",
      })
    }

    console.log("Login successful for user:", userData?.id)
    console.log("Cookies set, session should persist")

    return {
      success: true,
      user: userData,
      redirectUrl: userData?.has_baseline_resume ? "/dashboard" : "/onboarding",
    }
  } catch (error) {
    console.error("Exception in signIn:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign in",
    }
  }
}

export async function signUp(email: string, password: string, name: string) {
  try {
    const supabase = createServerClient()

    console.log("Starting sign up process for:", email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          full_name: name,
        },
      },
    })

    if (error) {
      console.error("Supabase signup error:", error)
      return {
        success: false,
        error: error.message,
        isRateLimited: error.message.includes("For security purposes"),
      }
    }

    if (!data.user) {
      return { success: false, error: "No user data returned from signup" }
    }

    console.log("Auth signup successful for user:", data.user.id)

    // Set authentication cookies if session exists
    if (data.session) {
      const cookieStore = cookies()

      cookieStore.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: data.session.expires_in,
        path: "/",
        sameSite: "lax",
      })

      cookieStore.set("sb-refresh-token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        sameSite: "lax",
      })

      cookieStore.set("authenticated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: data.session.expires_in,
        path: "/",
        sameSite: "lax",
      })

      cookieStore.set("user_id", data.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: data.session.expires_in,
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

    // Create user record in our users table using admin client
    let userData = null
    try {
      const adminSupabase = createServerSupabaseClient()

      // Check if user record already exists
      const { data: existingUser } = await adminSupabase
        .from("users")
        .select("*")
        .eq("auth_id", data.user.id)
        .maybeSingle()

      if (existingUser) {
        console.log("User record already exists:", existingUser.id)
        userData = existingUser
      } else {
        // Create new user record
        const { data: newUserData, error: userError } = await adminSupabase
          .from("users")
          .insert({
            auth_id: data.user.id,
            email: email.toLowerCase(),
            name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            has_baseline_resume: false,
            is_active: true,
          })
          .select()
          .single()

        if (userError) {
          console.error("Error creating user record:", userError)
          // Continue with minimal user data
          userData = {
            id: data.user.id,
            auth_id: data.user.id,
            email: data.user.email,
            name,
            has_baseline_resume: false,
          }
        } else {
          userData = newUserData
          console.log("User record created successfully:", userData.id)
        }
      }
    } catch (createException) {
      console.error("Exception creating user record:", createException)
      // Continue with minimal user data
      userData = {
        id: data.user.id,
        auth_id: data.user.id,
        email: data.user.email,
        name,
        has_baseline_resume: false,
      }
    }

    console.log("Signup successful for user:", userData?.id)

    return {
      success: true,
      user: userData,
      redirectUrl: "/onboarding",
    }
  } catch (error) {
    console.error("Exception in signUp:", error)
    return {
      success: false,
      error: "An unexpected error occurred during signup",
    }
  }
}

export async function signOut() {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      return { success: false, error: error.message }
    }

    // Clear all authentication cookies
    const cookieStore = cookies()
    cookieStore.set("authenticated", "", { maxAge: 0, path: "/" })
    cookieStore.set("user_id", "", { maxAge: 0, path: "/" })
    cookieStore.set("has_baseline_resume", "", { maxAge: 0, path: "/" })
    cookieStore.set("is_admin", "", { maxAge: 0, path: "/" })
    cookieStore.set("sb-access-token", "", { maxAge: 0, path: "/" })
    cookieStore.set("sb-refresh-token", "", { maxAge: 0, path: "/" })

    console.log("Sign out successful, cookies cleared")
    return { success: true }
  } catch (error) {
    console.error("Exception in signOut:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign out",
    }
  }
}

// Helper function to check if user is authenticated
export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Authentication required")
  }
  return session
}

// Helper function to get authenticated user data
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("User data not found")
  }
  return user
}
