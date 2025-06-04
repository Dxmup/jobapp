import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request, { params }: { params: { jobId: string } }) {
  try {
    const jobId = params.jobId
    console.log(`Add Event API: Processing request for job ${jobId}`)

    // Parse request body
    const body = await request.json()

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Try to get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session from Supabase auth, try to get user ID from cookies
    if (!session) {
      console.log("Add Event API: No session found from Supabase auth")

      // Check for user ID in cookies
      const cookieStore = cookies()
      const userId = cookieStore.get("user_id")?.value
      const isAuthenticated = cookieStore.get("authenticated")?.value === "true"

      if (!userId || !isAuthenticated) {
        console.log("Add Event API: No user ID found in cookies")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      console.log(`Add Event API: Found user ID ${userId} in cookies`)
    }

    // First check if the job_events table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabase.from("job_events").select("*").limit(1).maybeSingle()

    if (tableError && tableError.message.includes('relation "job_events" does not exist')) {
      console.log("Add Event API: job_events table doesn't exist, creating it")

      // Create the table directly with SQL
      const { error: createError } = await supabase.rpc("create_job_events_table")

      if (createError) {
        console.log(`Add Event API: Error creating table: ${createError.message}`)
        return NextResponse.json({ error: "Failed to create events table" }, { status: 500 })
      }
    }

    // Prepare basic event data (only include fields we know exist)
    const eventData: Record<string, any> = {
      job_id: jobId,
      title: body.title,
      date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
    }

    // Add optional fields if they exist in the request
    if (body.eventType) eventData.event_type = body.eventType
    if (body.description) eventData.description = body.description

    // Only add these fields if they exist in the table (we'll check in a moment)
    const contactFields = {
      contactName: "contact_name",
      contactEmail: "contact_email",
    }

    // Insert the event
    const { data: event, error: insertError } = await supabase.from("job_events").insert(eventData).select().single()

    if (insertError) {
      console.log(`Add Event API: Insert error: ${insertError.message}`)

      // If the error is about missing columns, try a simpler insert
      if (insertError.message.includes("column") && insertError.message.includes("does not exist")) {
        // Create a minimal version with just the required fields
        const minimalData = {
          job_id: jobId,
          title: body.title,
          date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
        }

        const { data: minimalEvent, error: minimalError } = await supabase
          .from("job_events")
          .insert(minimalData)
          .select()
          .single()

        if (minimalError) {
          console.log(`Add Event API: Minimal insert error: ${minimalError.message}`)
          return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
        }

        return NextResponse.json({ success: true, event: minimalEvent })
      }

      return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error("Add Event API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
