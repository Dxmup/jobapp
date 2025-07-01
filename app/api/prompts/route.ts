import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const category = searchParams.get("category")

    if (name) {
      // Get specific prompt by name
      const { data: prompt, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("name", name)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Database error:", error)
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
      }

      return NextResponse.json({ prompt })
    }

    if (category) {
      // Get all prompts in category
      const { data: prompts, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("name")

      if (error) {
        console.error("Database error:", error)
        return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
      }

      return NextResponse.json({ prompts: prompts || [] })
    }

    // Get all active prompts
    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
    }

    return NextResponse.json({ prompts: prompts || [] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
