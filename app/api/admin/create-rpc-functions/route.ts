import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Create a function to create tables if they don't exist
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE OR REPLACE FUNCTION create_table_if_not_exists(
          table_name TEXT,
          table_definition TEXT
        ) RETURNS VOID AS $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
          ) THEN
            EXECUTE 'CREATE TABLE public.' || quote_ident(table_name) || '(' || table_definition || ')';
          END IF;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
    })

    if (error) {
      console.error("Error creating RPC function:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "RPC functions created successfully" })
  } catch (error) {
    console.error("Error in create-rpc-functions:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
