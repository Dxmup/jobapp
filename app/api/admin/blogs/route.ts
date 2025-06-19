import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, let's check if the table exists
    const { data: tables, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "blogs")

    if (tableError) {
      console.error("Error checking table existence:", tableError)
    }

    if (!tables || tables.length === 0) {
      return NextResponse.json(
        {
          error: "Blogs table does not exist",
          tableNotFound: true,
        },
        { status: 404 },
      )
    }

    const { data: blogs, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching blogs:", error)
      return NextResponse.json({ error: "Failed to fetch blogs", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ blogs: blogs || [] })
  } catch (error) {
    console.error("Error in blogs GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, and content are required" },
        { status: 400 },
      )
    }

    const { data: blog, error } = await supabase.from("blogs").insert([body]).select().single()

    if (error) {
      console.error("Error creating blog:", error)
      return NextResponse.json({ error: "Failed to create blog", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ blog })
  } catch (error) {
    console.error("Error in blogs POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
