import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Simple SQL to create just the basic table without indexes
    const sql = `
    CREATE TABLE IF NOT EXISTS interview_questions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID NOT NULL,
      user_id UUID NOT NULL,
      resume_id UUID,
      technical_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
      behavioral_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`

    // First, check if the table already exists
    const { error: checkError } = await supabase.from("interview_questions").select("id").limit(1)

    if (!checkError) {
      // Table already exists
      return NextResponse.json({ success: true, message: "Table already exists" })
    }

    // Try to use our custom execute-sql endpoint
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/admin/execute-sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      })

      if (response.ok) {
        return NextResponse.json({ success: true, message: "Table created via execute-sql API" })
      }
    } catch (apiError) {
      console.error("Error calling execute-sql API:", apiError)
    }

    // Try to create the table using the REST API as a last resort
    try {
      const { error: insertError } = await supabase
        .from("interview_questions")
        .insert({
          id: "00000000-0000-0000-0000-000000000000",
          job_id: "00000000-0000-0000-0000-000000000000",
          user_id: "00000000-0000-0000-0000-000000000000",
          technical_questions: [],
          behavioral_questions: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (!insertError) {
        return NextResponse.json({ success: true, message: "Table created via REST API" })
      }

      // If the error is about duplicate key, the table exists
      if (insertError.message.includes("duplicate key")) {
        return NextResponse.json({ success: true, message: "Table already exists (duplicate key)" })
      }

      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    } catch (insertError) {
      console.error("Error creating table via REST API:", insertError)
      return NextResponse.json(
        { success: false, error: insertError instanceof Error ? insertError.message : "Unknown error" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in create-simple-table:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
