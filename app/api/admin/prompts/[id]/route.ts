import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: prompt, error } = await supabase.from("prompts").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Prompt not found", details: error.message }, { status: 404 })
    }

    return NextResponse.json({ prompt })
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { data: prompt, error } = await supabase
      .from("prompts")
      .update({
        name,
        category,
        description: description || null,
        content,
        variables: Array.from(variables),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update prompt", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ prompt })
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("prompts").delete().eq("id", params.id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete prompt", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
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
