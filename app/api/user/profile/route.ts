import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserIdOptional } from "@/lib/auth-cookie"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserIdOptional()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Not authenticated",
          user: null,
        },
        { status: 401 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("full_name, user_first_name, phone, address, city, state, zip_code")
      .eq("user_id", userId)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json(
        {
          error: "Failed to fetch profile",
          user: null,
        },
        { status: 500 },
      )
    }

    // Get basic user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name, created_at")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json(
        {
          error: "Failed to fetch user",
          user: null,
        },
        { status: 500 },
      )
    }

    // Combine user and profile data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      full_name: profile?.full_name || user.name || "",
      first_name: profile?.user_first_name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      city: profile?.city || "",
      state: profile?.state || "",
      zip_code: profile?.zip_code || "",
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Exception in user profile API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        user: null,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserIdOptional()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { fullName, phone, address, city, state, zipCode } = body

    // Extract first name from full name
    const firstName = fullName ? fullName.split(" ")[0].trim() : ""

    const supabase = createServerSupabaseClient()

    // Upsert user profile
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: userId,
        full_name: fullName,
        user_first_name: firstName,
        phone,
        address,
        city,
        state,
        zip_code: zipCode,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating user profile:", error)
      return NextResponse.json(
        {
          error: "Failed to update profile",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      profile: data,
    })
  } catch (error) {
    console.error("Exception in user profile update:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
