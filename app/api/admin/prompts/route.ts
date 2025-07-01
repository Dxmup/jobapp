import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // For now, skip authentication to get the basic functionality working
    // TODO: Add proper admin authentication later

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let query = supabase.from("prompts").select("*").order("created_at", { ascending: false })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: prompts, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch prompts", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ prompts: prompts || [] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const body = await request.json()
    const { name, category, description, content } = body

    if (!name || !category || !content) {
      return NextResponse.json({ error: "Missing required fields: name, category, content" }, { status: 400 })
    }

    // Extract variables from content
    const variableRegex = /\{([^}]+)\}/g
    const variables = new Set<string>()
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1])
    }

    // Check if prompt with this name already exists
    const { data: existing } = await supabase.from("prompts").select("id").eq("name", name).single()

    if (existing) {
      return NextResponse.json({ error: "Prompt with this name already exists" }, { status: 409 })
    }

    const { data: prompt, error } = await supabase
      .from("prompts")
      .insert({
        name,
        category,
        description: description || null,
        content,
        variables: Array.from(variables),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create prompt", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ prompt }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
