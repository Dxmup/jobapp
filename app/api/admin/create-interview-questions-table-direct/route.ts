import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // First check if the table already exists
    const { error: checkError } = await supabase.from("interview_questions").select("id").limit(1)

    // If no error, table exists
    if (!checkError) {
      return NextResponse.json({ success: true, message: "Table already exists" })
    }

    // Create the table using a simple approach
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS interview_questions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          job_id UUID NOT NULL,
          user_id UUID NOT NULL,
          resume_id UUID,
          technical_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
          behavioral_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (error) {
      // If RPC fails, try a different approach
      try {
        // Try to create the table using a direct insert
        // This will either create the table or fail with a "relation does not exist" error
        const { error: insertError } = await supabase.from("interview_questions").insert({
          id: "00000000-0000-0000-0000-000000000000",
          job_id: "00000000-0000-0000-0000-000000000000",
          user_id: "00000000-0000-0000-0000-000000000000",
          technical_questions: [],
          behavioral_questions: [],
        })

        if (insertError && !insertError.message.includes("does not exist")) {
          return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
        }
      } catch (insertError) {
        console.error("Error creating table via insert:", insertError)
      }

      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Table created successfully" })
  } catch (error) {
    console.error("Error in create-interview-questions-table-direct:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
