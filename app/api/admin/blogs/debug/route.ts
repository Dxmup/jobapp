import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if we can connect to Supabase
    const connectionTest = {
      supabaseUrl: !!supabaseUrl,
      supabaseServiceKey: !!supabaseServiceKey,
    }

    // Check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    // Try to access blogs table specifically
    const { data: blogsTest, error: blogsError } = await supabase.from("blogs").select("count").limit(1)

    // Check if exec_sql function exists
    const { data: functions, error: functionsError } = await supabase
      .from("information_schema.routines")
      .select("routine_name")
      .eq("routine_schema", "public")
      .eq("routine_name", "exec_sql")

    return NextResponse.json({
      connection: connectionTest,
      tables: {
        data: tables,
        error: tablesError?.message,
      },
      blogsTable: {
        accessible: !blogsError,
        error: blogsError?.message,
      },
      execSqlFunction: {
        exists: functions && functions.length > 0,
        error: functionsError?.message,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
