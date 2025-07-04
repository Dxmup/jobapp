import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("waitlist")
      .insert([
        {
          email: email.toLowerCase().trim(),
          source: "signup_page",
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ message: "Successfully added to waitlist", data }, { status: 201 })
  } catch (error) {
    console.error("Waitlist error:", error)
    return NextResponse.json({ error: "Failed to add to waitlist" }, { status: 500 })
  }
}
