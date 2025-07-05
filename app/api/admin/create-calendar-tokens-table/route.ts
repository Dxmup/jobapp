import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    // Check admin permissions here if needed

    const supabase = createAdminSupabaseClient()

    // Embed SQL directly instead of importing from file
    const createTableSQL = `
      -- Create table for storing user calendar tokens
      CREATE TABLE IF NOT EXISTS user_calendar_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL, -- 'google', 'outlook', etc.
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP WITH TIME ZONE,
        scope TEXT, -- Permissions granted
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, provider)
      );

      -- Create index for faster lookups
      CREATE INDEX IF NOT EXISTS idx_user_calendar_tokens_user_id 
      ON user_calendar_tokens(user_id);

      -- Create index for provider lookups
      CREATE INDEX IF NOT EXISTS idx_user_calendar_tokens_provider 
      ON user_calendar_tokens(provider);
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql: createTableSQL })

    if (error) {
      console.error("Error creating calendar tokens table:", error)
      return NextResponse.json(
        { error: "Failed to create calendar tokens table", details: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Calendar tokens table created successfully",
    })
  } catch (error) {
    console.error("Error in create-calendar-tokens-table API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
