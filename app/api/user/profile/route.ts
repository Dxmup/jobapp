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
    const { full_name, email, phone, address, city, state, zip_code } = body

    const supabase = createServerSupabaseClient()

    // Update user email and name in users table
    if (email || full_name) {
      const userUpdates: any = {
        updated_at: new Date().toISOString(),
      }

      if (email) userUpdates.email = email
      if (full_name) userUpdates.name = full_name

      const { error: userError } = await supabase.from("users").update(userUpdates).eq("id", userId)

      if (userError) {
        console.error("Error updating user:", userError)
        return NextResponse.json({ error: "Failed to update user information" }, { status: 500 })
      }
    }

    // Update or insert user profile (using the actual column names from the existing API)
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          full_name: full_name || null,
          email: email || null,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
          zip_code: zip_code || null,
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

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
