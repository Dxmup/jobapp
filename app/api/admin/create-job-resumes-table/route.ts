import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = createAdminSupabaseClient()

    // Create the job_resumes table
    const { error } = await supabase.query(`
      -- Create job_resumes table if it doesn't exist
      CREATE TABLE IF NOT EXISTS job_resumes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(job_id, resume_id)
      );
    `)

    if (error) {
      console.error("Error creating job_resumes table:", error)
      return NextResponse.json({ error: "Failed to create job_resumes table" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "job_resumes table created successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
