import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if email already exists
    const { data: existing } = await supabase.from("waitlist").select("email").eq("email", email.toLowerCase()).single()

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Insert new email
    const { data, error } = await supabase
      .from("waitlist")
      .insert({
        email: email.toLowerCase(),
        created_at: new Date().toISOString(),
        source: "signup_page",
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting waitlist email:", error)
      return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined waitlist",
    })
  } catch (error) {
    console.error("Waitlist API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("waitlist")
      .select("email, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching waitlist:", error)
      return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      emails: data,
    })
  } catch (error) {
    console.error("Waitlist GET API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
