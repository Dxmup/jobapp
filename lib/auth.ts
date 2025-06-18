import { createServerClient } from "@/lib/supabase/singleton"
import { createServerSupabaseClient as createAdminSupabaseClient } from "@/lib/supabase/server"

export async function getSession() {
  const supabase = createServerClient()
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) {
      console.error("[lib/auth:getSession] Error:", error.message)
      return null
    }
    if (session) {
      console.log("[lib/auth:getSession] Session retrieved successfully for user:", session.user.id)
    } else {
      console.log("[lib/auth:getSession] No active session found.")
    }
    return session
  } catch (error: any) {
    console.error("[lib/auth:getSession] Exception:", error.message)
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.user) {
    console.log("[lib/auth:getCurrentUser] No session, so no current user.")
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
      console.error("[lib/auth:getCurrentUser] Error fetching user data from 'users' table:", error.message)
      return null // Or perhaps return a partial user object based on session.user
    }
    if (userData) {
      console.log("[lib/auth:getCurrentUser] User data found in 'users' table:", userData.id)
    } else {
      console.warn(
        "[lib/auth:getCurrentUser] No user data found in 'users' table for auth_id:",
        session.user.id,
        "This might indicate a new user whose profile hasn't been created yet or a data inconsistency.",
      )
    }
    return userData
  } catch (error: any) {
    console.error("[lib/auth:getCurrentUser] Exception:", error.message)
    return null
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createServerClient()
  console.log("[lib/auth:signIn] Attempting for email:", email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("[lib/auth:signIn] Supabase auth.signInWithPassword error:", error.message)
    return { success: false, error: error.message }
  }

  if (!data.user || !data.session) {
    console.error("[lib/auth:signIn] No user or session data returned from Supabase despite no error.")
    return { success: false, error: "Authentication failed - no session created by Supabase." }
  }

  console.log("[lib/auth:signIn] Supabase auth.signInWithPassword successful for user:", data.user.id)
  console.log(
    "[lib/auth:signIn] Session from Supabase expires_at:",
    data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : "N/A",
  )

  // Try to fetch user data from our users table
  let userData = null
  try {
    // Use the same request-scoped client
    const { data: userRecord, error: userFetchError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", data.user.id)
      .maybeSingle()

    if (userFetchError) {
      console.error("[lib/auth:signIn] Error fetching user from 'users' table:", userFetchError.message)
    } else if (userRecord) {
      userData = userRecord
      console.log("[lib/auth:signIn] User record found in 'users' table:", userData.id)
    } else {
      console.log(
        "[lib/auth:signIn] No user record in 'users' table for auth_id:",
        data.user.id,
        "Attempting to create.",
      )
      // If no user record exists, create one using an admin client
      // This is a common pattern for auto-provisioning user profiles
      try {
        const adminSupabase = createAdminSupabaseClient()
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
          console.error("[lib/auth:signIn] Error creating user record with admin client:", createError.message)
          // Fallback: use minimal data from auth.user if profile creation fails
          userData = {
            id: data.user.id,
            auth_id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || "User",
            has_baseline_resume: false,
          }
        } else {
          userData = newUserData
          console.log("[lib/auth:signIn] User record created successfully in 'users' table:", userData.id)
        }
      } catch (createException: any) {
        console.error("[lib/auth:signIn] Exception creating user record with admin client:", createException.message)
        userData = {
          id: data.user.id,
          auth_id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || "User",
          has_baseline_resume: false,
        }
      }
    }
  } catch (fetchError: any) {
    console.error("[lib/auth:signIn] Exception fetching/creating user from 'users' table:", fetchError.message)
    // Fallback if 'users' table interaction fails
    userData = {
      id: data.user.id,
      auth_id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || "User",
      has_baseline_resume: false,
    }
  }

  return {
    success: true,
    user: userData,
    session: data.session,
    redirectUrl: userData?.has_baseline_resume ? "/dashboard" : "/onboarding",
  }
}

export async function signUp(email: string, password: string, name: string) {
  const supabase = createServerClient()
  console.log("[lib/auth:signUp] Attempting for email:", email)

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
    console.error("[lib/auth:signUp] Supabase signup error:", error.message)
    return {
      success: false,
      error: error.message,
      isRateLimited: error.message.includes("For security purposes"),
    }
  }

  if (!data.user) {
    console.error("[lib/auth:signUp] No user data returned from Supabase signUp despite no error.")
    return { success: false, error: "Signup failed - no user object from Supabase." }
  }
  console.log("[lib/auth:signUp] Supabase auth.signUp successful for user:", data.user.id)
  if (data.session) {
    console.log("[lib/auth:signUp] Session also created by Supabase during signUp.")
  } else {
    console.log("[lib/auth:signUp] No immediate session from Supabase (email confirmation might be pending).")
  }

  // Create user record in our 'users' table using an admin client
  let userProfileData = null
  try {
    const adminSupabase = createAdminSupabaseClient()
    const { data: newUserRecord, error: createError } = await adminSupabase
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

    if (createError) {
      console.error("[lib/auth:signUp] Error creating user record in 'users' table:", createError.message)
      // Fallback to auth user data if profile creation fails
      userProfileData = {
        id: data.user.id,
        auth_id: data.user.id,
        email: data.user.email,
        name,
        has_baseline_resume: false,
      }
    } else {
      userProfileData = newUserRecord
      console.log("[lib/auth:signUp] User record created in 'users' table:", userProfileData.id)
    }
  } catch (createException: any) {
    console.error("[lib/auth:signUp] Exception creating user record in 'users' table:", createException.message)
    userProfileData = {
      id: data.user.id,
      auth_id: data.user.id,
      email: data.user.email,
      name,
      has_baseline_resume: false,
    }
  }

  return {
    success: true,
    user: userProfileData,
    session: data.session,
    redirectUrl: data.session ? "/onboarding" : "/login?message=signup_success_check_email",
  }
}

export async function signOut() {
  const supabase = createServerClient()
  console.log("[lib/auth:signOut] Attempting.")
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("[lib/auth:signOut] Supabase auth.signOut error:", error.message)
    return { success: false, error: error.message }
  }
  console.log("[lib/auth:signOut] Supabase auth.signOut successful.")
  return { success: true }
}

// Helper function to check if user is authenticated (primarily for server components/actions)
export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    console.warn("[lib/auth:requireAuth] Authentication required, but no session found.")
    throw new Error("Authentication required")
  }
  return session
}

// Helper function to get authenticated user data from your 'users' table
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    console.warn("[lib/auth:requireUser] User data not found in 'users' table, though session might exist.")
    throw new Error("User data not found")
  }
  return user
}
