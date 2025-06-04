import { createServerSupabaseClient } from "@/lib/supabase/server"

/**
 * Ensures all required tables exist in the database
 * This function should be called during application startup
 */
export async function ensureDatabaseTables() {
  const supabase = createServerSupabaseClient()
  console.log("Running database migrations...")

  try {
    // Create interview_questions table using a simple approach
    const { error } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "interview_questions",
      table_definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_id UUID NOT NULL,
        user_id UUID NOT NULL,
        resume_id UUID,
        technical_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
        behavioral_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `,
    })

    if (error) {
      console.error("Error creating interview_questions table:", error)
      // If RPC fails, try direct SQL via API
      await createInterviewQuestionsTableViaAPI()
    } else {
      console.log("interview_questions table exists or was created successfully")
    }
  } catch (error) {
    console.error("Migration error:", error)
    // Try API as fallback
    await createInterviewQuestionsTableViaAPI()
  }
}

/**
 * Creates the interview_questions table via a dedicated API endpoint
 */
async function createInterviewQuestionsTableViaAPI() {
  try {
    const response = await fetch("/api/admin/create-interview-questions-table-direct", {
      method: "POST",
    })

    if (!response.ok) {
      console.error("Failed to create table via API:", await response.text())
    }
  } catch (error) {
    console.error("Error calling table creation API:", error)
  }
}
