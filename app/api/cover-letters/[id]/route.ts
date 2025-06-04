import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const coverLetterId = params.id
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the cover letter to verify it exists and belongs to the user
    const { data: coverLetter, error: coverLetterError } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("id", coverLetterId)
      .eq("user_id", user.id)
      .single()

    if (coverLetterError || !coverLetter) {
      return NextResponse.json({ error: "Cover letter not found or access denied" }, { status: 404 })
    }

    // Delete the cover letter
    const { error: deleteError } = await supabase
      .from("cover_letters")
      .delete()
      .eq("id", coverLetterId)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Error deleting cover letter:", deleteError)
      return NextResponse.json({ error: "Failed to delete cover letter" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/cover-letters/[id]:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
