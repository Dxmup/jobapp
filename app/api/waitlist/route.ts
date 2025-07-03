import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    const supabase = createClient()

    // Insert into waitlist
    const { error } = await supabase.from("waitlist").insert([
      {
        email: email.toLowerCase().trim(),
        source: "signup_page",
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      // Handle duplicate email
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already on our waitlist!" }, { status: 409 })
      }

      return NextResponse.json({ error: "Failed to join waitlist. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ message: "Successfully joined the waitlist!" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
