import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server" // Assuming this is your server-side Supabase client

export async function POST(request: Request) {
  const supabase = createClient()

  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string" || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Check if email already exists
    const { data: existingEntry, error: fetchError } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", email)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows found
      console.error("Error checking existing email:", fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingEntry) {
      return NextResponse.json({ message: "You're already on the waitlist!" }, { status: 200 })
    }

    // Insert new email
    const { error: insertError } = await supabase.from("waitlist").insert({ email })

    if (insertError) {
      console.error("Error inserting email into waitlist:", insertError)
      return NextResponse.json({ error: "Failed to add to waitlist" }, { status: 500 })
    }

    return NextResponse.json({ message: "Successfully joined the waitlist!" }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in waitlist API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("waitlist").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching waitlist data:", error)
      return NextResponse.json({ error: "Failed to fetch waitlist data" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in GET waitlist API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
