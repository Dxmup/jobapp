import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: blogs, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array with flag
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return NextResponse.json({ blogs: [], tableExists: false })
      }
      throw error
    }

    return NextResponse.json({ blogs: blogs || [], tableExists: true })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs", blogs: [], tableExists: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const blogData = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt || null,
      author_name: body.author_name || null,
      status: body.status || "draft",
      tags: body.tags || [],
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      featured_image_url: body.featured_image_url || null,
      published_at: body.status === "published" ? new Date().toISOString() : null,
    }

    const { data: blog, error } = await supabase.from("blogs").insert([blogData]).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({ blog })
  } catch (error) {
    console.error("Error creating blog:", error)
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
  }
}
