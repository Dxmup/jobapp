import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: blogs, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching blogs:", error)
      return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
    }

    return NextResponse.json({ blogs })
  } catch (error) {
    console.error("Error in blogs GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { data: blog, error } = await supabase.from("blogs").insert([body]).select().single()

    if (error) {
      console.error("Error creating blog:", error)
      return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
    }

    return NextResponse.json({ blog })
  } catch (error) {
    console.error("Error in blogs POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
