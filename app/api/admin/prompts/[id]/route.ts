import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkAdminPermission } from "@/lib/admin-auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hasPermission = await checkAdminPermission()
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: prompt, error } = await supabase.from("prompts").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching prompt:", error)
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error("Error in prompt GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hasPermission = await checkAdminPermission()
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, description, content, variables } = body

    if (!name || !category || !content) {
      return NextResponse.json({ error: "Name, category, and content are required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get current prompt to check if name is changing
    const { data: currentPrompt } = await supabase.from("prompts").select("name").eq("id", params.id).single()

    if (!currentPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    const { data: prompt, error } = await supabase
      .from("prompts")
      .update({
        name,
        category,
        description,
        content,
        variables: variables || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating prompt:", error)
      return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 })
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error("Error in prompt PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hasPermission = await checkAdminPermission()
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("prompts").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting prompt:", error)
      return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in prompt DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
