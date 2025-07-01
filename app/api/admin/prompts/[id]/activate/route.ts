import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkAdminPermission } from "@/lib/admin-auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hasPermission = await checkAdminPermission()
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get the prompt to activate
    const { data: promptToActivate, error: fetchError } = await supabase
      .from("prompts")
      .select("name")
      .eq("id", params.id)
      .single()

    if (fetchError || !promptToActivate) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    // Deactivate all other versions of this prompt
    const { error: deactivateError } = await supabase
      .from("prompts")
      .update({ is_active: false })
      .eq("name", promptToActivate.name)

    if (deactivateError) {
      console.error("Error deactivating other versions:", deactivateError)
      return NextResponse.json({ error: "Failed to deactivate other versions" }, { status: 500 })
    }

    // Activate the selected prompt
    const { data: prompt, error: activateError } = await supabase
      .from("prompts")
      .update({ is_active: true })
      .eq("id", params.id)
      .select()
      .single()

    if (activateError) {
      console.error("Error activating prompt:", activateError)
      return NextResponse.json({ error: "Failed to activate prompt" }, { status: 500 })
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error("Error in prompt activation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
