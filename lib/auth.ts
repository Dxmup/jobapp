import { createServerClient } from "@/lib/supabase/authClient"

export async function getSession() {
  const supabase = createServerClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function signIn(email, password) {
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

    // Fetch user data from the users table
    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (userError) {
        console.error("Error fetching user data:", userError)
        // If no user record exists, create one
        if (userError.code === "PGRST116") {
          const { data: newUserData, error: createError } = await supabase
            .from("users")
            .insert({
              auth_id: data.user.id,
              email: data.user.email?.toLowerCase(),
              name: data.user.user_metadata?.name || data.user.email?.split("@")[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              has_baseline_resume: false,
            })
            .select()
            .single()

          if (createError) {
            console.error("Error creating user record:", createError)
            return {
              success: true,
              user: {
                id: data.user.id,
                email: data.user.email,
                has_baseline_resume: false,
              },
              redirectUrl: "/dashboard",
            }
          }

          return {
            success: true,
            user: newUserData,
            redirectUrl: "/onboarding",
          }
        }

        // Return success but with minimal user data for other errors
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            has_baseline_resume: false,
          },
          redirectUrl: "/dashboard",
        }
      }

      // If we got multiple rows, take the first one
      const userRecord = Array.isArray(userData) ? userData[0] : userData

      if (!userRecord) {
        // No user record found, create one
        const { data: newUserData, error: createError } = await supabase
          .from("users")
          .insert({
            auth_id: data.user.id,
            email: data.user.email?.toLowerCase(),
            name: data.user.user_metadata?.name || data.user.email?.split("@")[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            has_baseline_resume: false,
          })
          .select()
          .single()

        if (createError) {
          console.error("Error creating user record:", createError)
          return {
            success: true,
            user: {
              id: data.user.id,
              email: data.user.email,
              has_baseline_resume: false,
            },
            redirectUrl: "/dashboard",
          }
        }

        return {
          success: true,
          user: newUserData,
          redirectUrl: "/onboarding",
        }
      }

      // Return with user data
      return {
        success: true,
        user: userRecord,
        redirectUrl: userRecord.has_baseline_resume ? "/dashboard" : "/onboarding",
      }
    }

    // Fallback if no user data
    return {
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        has_baseline_resume: false,
      },
      redirectUrl: "/dashboard",
    }
  } catch (error) {
    console.error("Error signing in:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign in",
    }
  }
}

export async function signUp(email, password, name) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
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

    // Create user record in our users table
    if (data.user) {
      // Check if user record already exists
      const { data: existingUser } = await supabase.from("users").select("*").eq("auth_id", data.user.id).limit(1)

      if (existingUser && existingUser.length > 0) {
        // User record already exists, return it
        return {
          success: true,
          user: existingUser[0],
          redirectUrl: existingUser[0].has_baseline_resume ? "/dashboard" : "/onboarding",
        }
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert({
          auth_id: data.user.id,
          email: email.toLowerCase(),
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          has_baseline_resume: false,
        })
        .select()
        .single()

      if (userError) {
        console.error("Error creating user record:", userError)
        // Return success but with minimal user data
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            has_baseline_resume: false,
          },
          redirectUrl: "/onboarding",
        }
      }

      // Return with full user data
      return {
        success: true,
        user: userData,
        redirectUrl: "/onboarding",
      }
    }

    // Fallback if no user data
    return {
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        has_baseline_resume: false,
      },
      redirectUrl: "/onboarding",
    }
  } catch (error) {
    console.error("Error signing up:", error)
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

    return { success: true }
  } catch (error) {
    console.error("Error signing out:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign out",
    }
  }
}
