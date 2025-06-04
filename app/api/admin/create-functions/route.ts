import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Create a Supabase client with the service role key
function createServiceRoleClient() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or service role key")
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "lib", "supabase", "get-user-resumes-count-function.sql")
    const sql = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error creating function:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Function created successfully" })
  } catch (error) {
    console.error("Error creating function:", error)
    return NextResponse.json(
      {
        error: "Failed to create function",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
