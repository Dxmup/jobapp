import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkAdminPermission } from "@/lib/admin-auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()

    // Check admin permission
    const adminCheck = await checkAdminPermission(supabase)
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 })
    }

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
    const supabase = createServerSupabaseClient()

    // Check admin permission
    const adminCheck = await checkAdminPermission(supabase)
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const { description, content, variables, is_active } = body

    const { data: prompt, error } = await supabase
      .from("prompts")
      .update({
        description,
        content,
        variables: variables || [],
        is_active,
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
    const supabase = createServerSupabaseClient()

    // Check admin permission
    const adminCheck = await checkAdminPermission(supabase)
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 })
    }

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
