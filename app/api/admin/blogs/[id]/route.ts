import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

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
      updated_at: new Date().toISOString(),
    }

    const { data: blog, error } = await supabase.from("blogs").update(blogData).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({ blog })
  } catch (error) {
    console.error("Error updating blog:", error)
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { error } = await supabase.from("blogs").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}
