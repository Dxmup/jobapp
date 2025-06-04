import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: { jobId: string } }) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authUserId = session.user.id
    const jobId = params.jobId

    // Get the event ID from the URL search params
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // First verify that the job belongs to the current user
    // This query joins the jobs table with the users table to check ownership
    const { data: jobOwnership, error: ownershipError } = await supabase
      .from("jobs")
      .select(`
        id,
        user_id,
        users!inner(
          id,
          auth_id
        )
      `)
      .eq("id", jobId)
      .eq("users.auth_id", authUserId)
      .single()

    if (ownershipError) {
      if (ownershipError.code === "PGRST116") {
        // Job not found or doesn't belong to this user
        return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 })
      }
      throw ownershipError
    }

    // Delete the event
    const { error: deleteError } = await supabase.from("job_events").delete().eq("id", eventId).eq("job_id", jobId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting timeline event:", error)
    return NextResponse.json({ error: "Failed to delete timeline event" }, { status: 500 })
  }
}
