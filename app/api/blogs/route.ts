import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const { data: blogs, error } = await supabase
      .from("blogs")
      .select("id, title, slug, excerpt, featured_image_url, author_name, published_at, tags")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching published blogs:", error)
      return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
    }

    return NextResponse.json({ blogs })
  } catch (error) {
    console.error("Error in public blogs GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
