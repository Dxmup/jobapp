import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "lib", "supabase", "create-roles-tables.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Try to execute using exec_sql function
    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlQuery }).catch(async () => {
      // If exec_sql fails, try direct SQL execution
      console.log("exec_sql failed, trying direct SQL execution")
      return await supabase.auth.admin.executeRawQuery(sqlQuery)
    })

    if (error) {
      console.error("Error creating roles tables:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Roles tables created successfully" })
  } catch (error) {
    console.error("Exception in ensure-roles-table:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
