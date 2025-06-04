import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jobId = params.id

    // First check if the job exists and get the user_id
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

    // Fetch events directly with Supabase
    const { data: events, error: eventsError } = await supabase
      .from("job_events")
      .select("*")
      .eq("job_id", jobId)
      .order("date", { ascending: false })

    if (eventsError) {
      throw eventsError
    }

    return NextResponse.json({ events: events || [] })
  } catch (error) {
    console.error("Error fetching job events:", error)
    return NextResponse.json({ error: "Failed to fetch job events" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jobId = params.id

    // First check if the job exists and get the user_id
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

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.eventType || !data.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const now = new Date().toISOString()

    // Create the event directly with Supabase
    const { data: event, error: createError } = await supabase
      .from("job_events")
      .insert({
        job_id: jobId,
        event_type: data.eventType,
        title: data.title,
        description: data.description || null,
        date: data.date,
        contact_name: data.contactName || null,
        contact_email: data.contactEmail || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error("Error creating job event:", error)
    return NextResponse.json({ error: "Failed to create job event" }, { status: 500 })
  }
}
