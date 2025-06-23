import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserIdOptional } from "@/lib/auth-cookie"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserIdOptional()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get user basic info
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user profile info
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single()

    // Combine user and profile data
    const profile = {
      ...user,
      ...userProfile,
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserIdOptional()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      full_name,
      first_name,
      last_name,
      phone,
      location,
      bio,
      job_title,
      company,
      linkedin_url,
      github_url,
      website_url,
    } = body

    const supabase = createServerSupabaseClient()

    // Update or insert user profile
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          full_name,
          first_name,
          last_name,
          phone,
          location,
          bio,
          job_title,
          company,
          linkedin_url,
          github_url,
          website_url,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    // Also update the user's name in the users table if full_name is provided
    if (full_name) {
      await supabase
        .from("users")
        .update({
          name: full_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
