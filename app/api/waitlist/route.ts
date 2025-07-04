import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if email already exists
    const { data: existing } = await supabase.from("waitlist").select("email").eq("email", email).single()

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Add to waitlist
    const { error } = await supabase.from("waitlist").insert({
      email,
      name: name || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Waitlist error:", error)
      return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Successfully joined waitlist!" })
  } catch (error) {
    console.error("Waitlist API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
