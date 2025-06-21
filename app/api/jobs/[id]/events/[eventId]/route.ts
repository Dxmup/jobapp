import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { id: string; eventId: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const jobId = params.id
    const eventId = params.eventId

    console.log(`Fetching event ${eventId} for job ${jobId}`)

    // Try to get session first
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let userId: string | null = null

    if (session) {
      // Get user from users table using auth_id
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", session.user.id)
        .single()

      if (userError) {
        console.error("Error fetching user from session:", userError)
      } else {
        userId = user.id
      }
    }

    // If no session, try cookies (your fallback auth method)
    if (!userId) {
      const cookieStore = cookies()
      const cookieUserId = cookieStore.get("user_id")?.value
      const isAuthenticated = cookieStore.get("authenticated")?.value === "true"

      if (cookieUserId && isAuthenticated) {
        userId = cookieUserId
        console.log(`Using cookie auth for user ${userId}`)
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First verify the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, user_id, title, company")
      .eq("id", jobId)
      .single()

    if (jobError) {
      console.error("Error fetching job:", jobError)
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check job ownership
    if (job.user_id !== userId) {
      console.log(`Job ownership mismatch: job.user_id=${job.user_id}, userId=${userId}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Now fetch the event (events are linked to jobs, not directly to users)
    const { data: event, error: eventError } = await supabase
      .from("job_events")
      .select("*")
      .eq("id", eventId)
      .eq("job_id", jobId)
      .single()

    if (eventError) {
      console.error("Error fetching event:", eventError)
      if (eventError.code === "PGRST116") {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
    }

    console.log(`Successfully fetched event ${eventId}`)
    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error in GET event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string; eventId: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const jobId = params.id
    const eventId = params.eventId

    // Same auth logic as GET
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let userId: string | null = null

    if (session) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", session.user.id)
        .single()

      if (!userError && user) {
        userId = user.id
      }
    }

    if (!userId) {
      const cookieStore = cookies()
      const cookieUserId = cookieStore.get("user_id")?.value
      const isAuthenticated = cookieStore.get("authenticated")?.value === "true"

      if (cookieUserId && isAuthenticated) {
        userId = cookieUserId
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify job ownership
    const { data: job, error: jobError } = await supabase.from("jobs").select("id, user_id").eq("id", jobId).single()

    if (jobError || job.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()

    // Update the event
    const { data: updatedEvent, error: updateError } = await supabase
      .from("job_events")
      .update({
        event_type: data.eventType,
        title: data.title,
        description: data.description || null,
        date: data.date,
        contact_name: data.contactName || null,
        contact_email: data.contactEmail || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .eq("job_id", jobId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating event:", updateError)
      return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
    }

    return NextResponse.json({ success: true, event: updatedEvent })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; eventId: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const jobId = params.id
    const eventId = params.eventId

    // Same auth logic
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let userId: string | null = null

    if (session) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", session.user.id)
        .single()

      if (!userError && user) {
        userId = user.id
      }
    }

    if (!userId) {
      const cookieStore = cookies()
      const cookieUserId = cookieStore.get("user_id")?.value
      const isAuthenticated = cookieStore.get("authenticated")?.value === "true"

      if (cookieUserId && isAuthenticated) {
        userId = cookieUserId
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify job ownership
    const { data: job, error: jobError } = await supabase.from("jobs").select("id, user_id").eq("id", jobId).single()

    if (jobError || job.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the event
    const { error: deleteError } = await supabase.from("job_events").delete().eq("id", eventId).eq("job_id", jobId)

    if (deleteError) {
      console.error("Error deleting event:", deleteError)
      return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
