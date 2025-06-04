import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Try to create the table directly with a simple query
    const { error } = await supabase.rpc("create_job_events_table")

    if (error) {
      console.error("Error calling create_job_events_table function:", error)

      // Try direct SQL as a fallback
      const { error: directError } = await supabase.from("job_events").insert({
        job_id: "00000000-0000-0000-0000-000000000000",
        title: "Test Event",
        date: new Date().toISOString(),
      })

      if (directError && directError.message.includes('relation "job_events" does not exist')) {
        // Table doesn't exist, try to create it with a direct query
        const { error: createError } = await supabase.rpc("create_table", {
          table_name: "job_events",
          columns:
            "id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), job_id UUID NOT NULL, title TEXT NOT NULL, date TIMESTAMPTZ NOT NULL",
        })

        if (createError) {
          return NextResponse.json(
            {
              error: `Error creating table: ${createError.message}`,
              success: false,
            },
            { status: 500 },
          )
        }
      } else if (!directError) {
        // Table exists, delete the test event
        await supabase.from("job_events").delete().eq("job_id", "00000000-0000-0000-0000-000000000000")
      }
    }

    return NextResponse.json({
      message: "job_events table created or verified successfully",
      success: true,
    })
  } catch (error) {
    console.error("Error creating job_events table:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
