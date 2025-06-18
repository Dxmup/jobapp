import { createServerClient } from "@/lib/supabase/authClient"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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

export async function signIn(email: string, password: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error signing in:", error)
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: "No user data returned" }
    }

    console.log("Auth successful for user:", data.user.id)

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

    console.log("Login successful for user:", userData.id)

    return {
      success: true,
      user: userData,
      redirectUrl: userData.has_baseline_resume ? "/dashboard" : "/onboarding",
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
      console.error("Error signing up:", error)
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

    console.log("Signup successful for user:", userData.id)

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

    console.log("Sign out successful")
    return { success: true }
  } catch (error) {
    console.error("Exception in signOut:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign out",
    }
  }
}
