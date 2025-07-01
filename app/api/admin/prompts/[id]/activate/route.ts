import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkAdminPermission } from "@/lib/admin-auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()

    // Check admin permission
    const adminCheck = await checkAdminPermission(supabase)
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 })
    }

    // Get the prompt to activate
    const { data: promptToActivate, error: fetchError } = await supabase
      .from("prompts")
      .select("name")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    // Deactivate all other versions of this prompt
    await supabase.from("prompts").update({ is_active: false }).eq("name", promptToActivate.name)

    // Activate the selected version
    const { data: prompt, error } = await supabase
      .from("prompts")
      .update({ is_active: true })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error activating prompt:", error)
      return NextResponse.json({ error: "Failed to activate prompt" }, { status: 500 })
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error("Error in prompt activation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
