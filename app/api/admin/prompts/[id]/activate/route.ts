import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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
      .eq("is_active", true)

    if (deactivateError) {
      console.error("Error deactivating prompts:", deactivateError)
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
