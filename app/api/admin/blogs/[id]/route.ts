import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { id } = params

    const { data: blog, error } = await supabase.from("blogs").update(body).eq("id", id).select().single()

    if (error) {
      console.error("Error updating blog:", error)
      return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
    }

    return NextResponse.json({ blog })
  } catch (error) {
    console.error("Error in blog PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { id } = params

    const { error } = await supabase.from("blogs").delete().eq("id", id)

    if (error) {
      console.error("Error deleting blog:", error)
      return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
    }

    return NextResponse.json({ message: "Blog deleted successfully" })
  } catch (error) {
    console.error("Error in blog DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
