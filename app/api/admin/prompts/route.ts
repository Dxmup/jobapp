import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkAdminPermission } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Check admin permission
    const adminCheck = await checkAdminPermission(supabase)
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const includeInactive = searchParams.get("includeInactive") === "true"
    const name = searchParams.get("name")

    let query = supabase
      .from("prompts")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })
      .order("version", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    if (name) {
      query = query.eq("name", name)
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
    const supabase = createServerSupabaseClient()

    // Check admin permission
    const adminCheck = await checkAdminPermission(supabase)
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, description, content, variables } = body

    if (!name || !category || !content) {
      return NextResponse.json(
        {
          error: "Name, category, and content are required",
        },
        { status: 400 },
      )
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Check if prompt with this name already exists
    const { data: existingPrompts } = await supabase
      .from("prompts")
      .select("version")
      .eq("name", name)
      .order("version", { ascending: false })
      .limit(1)

    const nextVersion = existingPrompts && existingPrompts.length > 0 ? existingPrompts[0].version + 1 : 1

    // If this is a new version, deactivate the current active version
    if (nextVersion > 1) {
      await supabase.from("prompts").update({ is_active: false }).eq("name", name).eq("is_active", true)
    }

    // Insert new prompt
    const { data: prompt, error } = await supabase
      .from("prompts")
      .insert({
        name,
        category,
        description,
        content,
        variables: variables || [],
        version: nextVersion,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating prompt:", error)
      return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error("Error in prompts POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
