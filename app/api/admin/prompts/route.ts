import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const includeInactive = searchParams.get("includeInactive") === "true"

    let query = supabase
      .from("prompts")
      .select("*")
      .order("name", { ascending: true })
      .order("version", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    const { data: prompts, error } = await query

    if (error) {
      console.error("Error fetching prompts:", error)
      return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
    }

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error("Error in prompts GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, description, content, variables } = body

    if (!name || !category || !content) {
      return NextResponse.json({ error: "Name, category, and content are required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if prompt with this name already exists
    const { data: existingPrompt } = await supabase
      .from("prompts")
      .select("name, version")
      .eq("name", name)
      .order("version", { ascending: false })
      .limit(1)
      .single()

    const newVersion = existingPrompt ? existingPrompt.version + 1 : 1

    // If this is a new version, deactivate the current active version
    if (existingPrompt) {
      await supabase.from("prompts").update({ is_active: false }).eq("name", name).eq("is_active", true)
    }

    const { data: prompt, error } = await supabase
      .from("prompts")
      .insert({
        name,
        category,
        description,
        content,
        variables: variables || [],
        version: newVersion,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating prompt:", error)
      return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
    }

    return NextResponse.json({ prompt }, { status: 201 })
  } catch (error) {
    console.error("Error in prompts POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
