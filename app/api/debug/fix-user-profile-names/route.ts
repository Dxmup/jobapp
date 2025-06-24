import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    console.log("🔍 Starting user profile names fix...")

    // Step 1: Check current table schema
    console.log("📋 Step 1: Checking current user_profiles table schema...")

    const { data: columns, error: schemaError } = await supabase.rpc("exec_sql", {
      sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'user_profiles' 
          ORDER BY ordinal_position;
        `,
    })

    if (schemaError) {
      console.error("❌ Error checking schema:", schemaError)
      return NextResponse.json({
        success: false,
        error: "Failed to check table schema",
        details: schemaError,
      })
    }

    console.log("📊 Current user_profiles columns:", columns)

    // Check if first_name or user_first_name exists
    const hasFirstName = columns?.some((col: any) => col.column_name === "first_name")
    const hasUserFirstName = columns?.some((col: any) => col.column_name === "user_first_name")

    console.log(`🔍 Has first_name: ${hasFirstName}, Has user_first_name: ${hasUserFirstName}`)

    // Step 2: Add missing columns if needed
    if (!hasFirstName && !hasUserFirstName) {
      console.log("➕ Step 2: Adding user_first_name column...")

      const { error: addColumnError } = await supabase.rpc("exec_sql", {
        sql: `
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS user_first_name VARCHAR(100);
            
            CREATE INDEX IF NOT EXISTS idx_user_profiles_first_name 
            ON user_profiles(user_first_name);
          `,
      })

      if (addColumnError) {
        console.error("❌ Error adding column:", addColumnError)
        return NextResponse.json({
          success: false,
          error: "Failed to add user_first_name column",
          details: addColumnError,
        })
      }

      console.log("✅ Added user_first_name column")
    }

    // Step 3: Check current user_profiles data
    console.log("📋 Step 3: Checking current user_profiles data...")

    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, full_name, user_first_name")
      .limit(10)

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError)
    } else {
      console.log("👥 Current profiles sample:", profiles)
    }

    // Step 4: Populate user_first_name from full_name where missing
    console.log("🔄 Step 4: Populating user_first_name from full_name...")

    const { error: updateError } = await supabase.rpc("exec_sql", {
      sql: `
          UPDATE user_profiles 
          SET user_first_name = CASE
            WHEN full_name IS NOT NULL AND trim(full_name) != '' THEN
              trim(split_part(full_name, ' ', 1))
            ELSE NULL
          END
          WHERE user_first_name IS NULL OR user_first_name = '';
        `,
    })

    if (updateError) {
      console.error("❌ Error updating user_first_name:", updateError)
      return NextResponse.json({
        success: false,
        error: "Failed to populate user_first_name",
        details: updateError,
      })
    }

    console.log("✅ Populated user_first_name from full_name")

    // Step 5: Check the results
    console.log("📋 Step 5: Checking updated data...")

    const { data: updatedProfiles, error: updatedError } = await supabase
      .from("user_profiles")
      .select("user_id, full_name, user_first_name")
      .limit(10)

    if (updatedError) {
      console.error("❌ Error fetching updated profiles:", updatedError)
    } else {
      console.log("👥 Updated profiles sample:", updatedProfiles)
    }

    // Step 6: Test getUserProfile function for the current user
    console.log("🧪 Step 6: Testing getUserProfile function...")

    // Get current user ID from auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("⚠️ No authenticated user to test with")
      return NextResponse.json({
        success: true,
        message: "User profile names fix completed successfully!",
        steps: [
          "✅ Checked table schema",
          hasFirstName || hasUserFirstName
            ? "✅ user_first_name column already existed"
            : "✅ Added user_first_name column",
          "✅ Populated user_first_name from full_name",
          "⚠️ Could not test with current user (not authenticated)",
        ],
        data: {
          columns,
          sampleProfiles: updatedProfiles,
        },
      })
    }

    // Test the profile lookup for current user
    const { data: testProfile, error: testError } = await supabase
      .from("user_profiles")
      .select("user_id, full_name, user_first_name")
      .eq("user_id", user.id)
      .single()

    console.log("🧪 Test profile result:", { testProfile, testError })

    return NextResponse.json({
      success: true,
      message: "User profile names fix completed successfully!",
      steps: [
        "✅ Checked table schema",
        hasFirstName || hasUserFirstName
          ? "✅ user_first_name column already existed"
          : "✅ Added user_first_name column",
        "✅ Populated user_first_name from full_name",
        testProfile
          ? `✅ Test user profile: ${testProfile.user_first_name || "No first name found"}`
          : "⚠️ No profile found for current user",
      ],
      data: {
        columns,
        sampleProfiles: updatedProfiles,
        testProfile,
        currentUserId: user.id,
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
