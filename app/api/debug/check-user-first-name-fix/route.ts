import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUserId } from "@/lib/auth-cookie"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const userId = await getCurrentUserId()

    console.log("🔍 Checking if user_first_name fix worked...")

    // Step 1: Check if user_first_name column exists by trying to query it
    console.log("📋 Step 1: Testing if user_first_name column exists...")

    const { data: testColumn, error: columnError } = await supabase
      .from("user_profiles")
      .select("user_first_name")
      .limit(1)

    if (columnError) {
      return NextResponse.json({
        success: false,
        message: "❌ user_first_name column does NOT exist",
        error: columnError.message,
        recommendation: "The scripts didn't run successfully. The column wasn't added.",
      })
    }

    console.log("✅ user_first_name column exists!")

    // Step 2: Check current user's profile data
    console.log("👤 Step 2: Checking your profile data...")

    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_id, full_name, user_first_name")
      .eq("user_id", userId)
      .single()

    console.log("Profile result:", { userProfile, profileError })

    // Step 3: Check a few sample profiles to see if data was populated
    console.log("📊 Step 3: Checking sample profiles...")

    const { data: sampleProfiles, error: sampleError } = await supabase
      .from("user_profiles")
      .select("user_id, full_name, user_first_name")
      .not("full_name", "is", null)
      .limit(5)

    console.log("Sample profiles:", sampleProfiles)

    // Step 4: Test the getUserProfile function
    console.log("🧪 Step 4: Testing getUserProfile function...")

    // Import and test the function
    const { getUserProfile } = await import("@/app/actions/interview-prep-actions")
    const profileResult = await getUserProfile()

    console.log("getUserProfile result:", profileResult)

    return NextResponse.json({
      success: true,
      message: "✅ Check completed!",
      results: {
        columnExists: !columnError,
        yourProfile: userProfile || "No profile found",
        sampleProfiles: sampleProfiles || [],
        getUserProfileTest: profileResult,
        summary: {
          columnAdded: !columnError ? "✅ YES" : "❌ NO",
          yourDataPopulated: userProfile?.user_first_name ? "✅ YES" : "❌ NO",
          functionWorks: profileResult?.profile?.firstName !== "the candidate" ? "✅ YES" : "❌ NO",
        },
      },
    })
  } catch (error) {
    console.error("💥 Error checking fix:", error)
    return NextResponse.json({
      success: false,
      error: "Error checking fix",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
