import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jobId = params.id
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // First check if the job exists
    const { data: job, error: jobError } = await supabase.from("jobs").select("*").eq("id", jobId).single()

    if (jobError) {
      if (jobError.code === "PGRST116") {
        return NextResponse.json({ error: "Job not found" }, { status: 404 })
      }
      throw jobError
    }

    // Get the user from the users table using auth_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", session.user.id)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if the user owns this job
    if (job.user_id !== user.id) {
      console.log(`User ID mismatch: job.user_id=${job.user_id}, user.id=${user.id}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if the event exists and belongs to this job
    const { data: event, error: eventError } = await supabase
      .from("job_events")
      .select("*")
      .eq("id", eventId)
      .eq("job_id", jobId)
      .single()

    if (eventError) {
      if (eventError.code === "PGRST116") {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }
      throw eventError
    }

    // Delete the event
    const { error: deleteError } = await supabase.from("job_events").delete().eq("id", eventId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job event:", error)
    return NextResponse.json({ error: "Failed to delete job event" }, { status: 500 })
  }
}
