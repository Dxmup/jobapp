import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: testimonials, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching testimonials:", error)
      return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
    }

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if user is admin
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { quote, author, position, company, display_order } = body

    if (!quote || !author) {
      return NextResponse.json({ error: "Quote and author are required" }, { status: 400 })
    }

    const { data: testimonial, error } = await supabase
      .from("testimonials")
      .insert({
        quote,
        author,
        position,
        company,
        display_order: display_order || 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating testimonial:", error)
      return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
    }

    return NextResponse.json({ testimonial })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
