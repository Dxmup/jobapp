"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUserId } from "@/lib/auth-cookie"

export async function getUserProfile(userId?: string): Promise<{
  success: boolean
  profile?: {
    user_first_name?: string
    first_name?: string
    last_name?: string
    full_name?: string
    email?: string
  }
  error?: string
}> {
  try {
    const supabase = createServerSupabaseClient()
    const currentUserId = userId || (await getCurrentUserId())

    console.log(`🔍 Getting user profile for: ${currentUserId}`)

    // First try to get from user_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_first_name, first_name, last_name, full_name")
      .eq("user_id", currentUserId)
      .single()

    if (!profileError && profileData) {
      console.log(`✅ Found user profile:`, profileData)
      return {
        success: true,
        profile: profileData,
      }
    }

    console.log(`⚠️ No profile found in user_profiles table:`, profileError)

    // Fallback: try to get from auth user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (!userError && user) {
      console.log(`✅ Found auth user metadata:`, user.user_metadata)
      return {
        success: true,
        profile: {
          first_name: user.user_metadata?.first_name,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          email: user.email,
        },
      }
    }

    console.log(`❌ No auth user found:`, userError)

    return {
      success: false,
      error: "User profile not found",
    }
  } catch (error) {
    console.error("❌ Error fetching user profile:", error)
    return {
      success: false,
      error: `Failed to fetch user profile: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
