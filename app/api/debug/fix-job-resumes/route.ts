import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "This endpoint is only available in development mode" }, { status: 403 })
    }

    const supabase = createServerSupabaseClient()

    // Embed SQL directly instead of importing from file
    const addUserIdSQL = `
      -- Add user_id column to job_resumes table if it doesn't exist
      DO $$ 
      BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name='job_resumes' AND column_name='user_id') THEN
             ALTER TABLE job_resumes ADD COLUMN user_id UUID;
         END IF;
     END $$;

     -- Update job_resumes with user_id from jobs table
     UPDATE job_resumes 
     SET user_id = jobs.user_id 
     FROM jobs 
     WHERE job_resumes.job_id = jobs.id 
     AND job_resumes.user_id IS NULL;
    `

    // Execute the SQL using rpc if available, otherwise use direct query
    try {
      const { error } = await supabase.rpc("exec_sql", { sql: addUserIdSQL })
      if (error) throw error
    } catch (rpcError) {
      // Fallback: execute each statement separately
      const statements = addUserIdSQL.split(";").filter((s) => s.trim())

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc("exec_sql", { sql: statement.trim() })
          if (error) {
            console.error("Error executing statement:", statement, error)
          }
        }
      }
    }

    // Count the updated records
    const { count, error: countError } = await supabase
      .from("job_resumes")
      .select("*", { count: "exact", head: true })
      .not("user_id", "is", null)

    return NextResponse.json({
      success: true,
      message: "Successfully updated job_resumes table",
      updatedRecords: count || 0,
    })
  } catch (error) {
    console.error("Error in fix-job-resumes API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
