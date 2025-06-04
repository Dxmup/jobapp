import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // SQL to create the exec_sql function
    const sql = `
    -- Create function to execute arbitrary SQL if it doesn't exist
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql;
    `

    // Execute the SQL directly using query instead of rpc
    const { error } = await supabase.query(sql)

    if (error) {
      console.error("Error creating exec_sql function:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "exec_sql function created successfully" })
  } catch (error) {
    console.error("Error in create-exec-sql-function:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
