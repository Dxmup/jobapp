import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    console.log("🔍 Starting user profile names fix...")

    // Step 1: Check current user_profiles data
    console.log("📋 Step 1: Checking current user_profiles data...")

    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, full_name")
      .limit(5)

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError)
      return NextResponse.json({
        success: false,
        error: "Failed to fetch user profiles",
        details: profilesError,
      })
    }

    console.log("👥 Current profiles sample:", profiles)

    // Step 2: Get current user to test with
    console.log("🔍 Step 2: Getting current user...")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json({
        success: false,
        error: "Failed to get current user",
        details: authError,
      })
    }

    console.log("👤 Current user ID:", user?.id)

    // Step 3: Check if current user has a profile
    let userProfile = null
    if (user?.id) {
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (profileError) {
        console.log("⚠️ No profile found for current user:", profileError.message)
      } else {
        userProfile = profile
        console.log("👤 Current user profile:", profile)
      }
    }

    // Step 4: Check auth user metadata
    console.log("🔍 Step 4: Checking auth user metadata...")
    console.log("👤 User metadata:", user?.user_metadata)
    console.log("👤 User email:", user?.email)

    // Step 5: Test the getUserProfile logic manually
    console.log("🧪 Step 5: Testing getUserProfile logic...")

    let testResult = "No name found"

    if (userProfile?.full_name) {
      testResult = userProfile.full_name.split(" ")[0]
      console.log("✅ Found name from profile full_name:", testResult)
    } else if (user?.user_metadata?.full_name) {
      testResult = user.user_metadata.full_name.split(" ")[0]
      console.log("✅ Found name from auth metadata full_name:", testResult)
    } else if (user?.user_metadata?.first_name) {
      testResult = user.user_metadata.first_name
      console.log("✅ Found name from auth metadata first_name:", testResult)
    } else if (user?.email) {
      testResult = user.email.split("@")[0]
      console.log("✅ Found name from email:", testResult)
    } else {
      console.log("❌ No name source found, would default to 'the candidate'")
    }

    return NextResponse.json({
      success: true,
      message: "User profile debug completed!",
      data: {
        currentUserId: user?.id,
        userEmail: user?.email,
        userMetadata: user?.user_metadata,
        userProfile: userProfile,
        profilesCount: profiles?.length || 0,
        sampleProfiles: profiles,
        testResult: testResult,
        nameSource: userProfile?.full_name
          ? "profile.full_name"
          : user?.user_metadata?.full_name
            ? "auth.metadata.full_name"
            : user?.user_metadata?.first_name
              ? "auth.metadata.first_name"
              : user?.email
                ? "email"
                : "none (would default to 'the candidate')",
      },
    })
  } catch (error) {
    console.error("💥 Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: "Unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
