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
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sqlQuery })

    // If there was an error, try direct execution
    if (error) {
      console.log("Error using exec_sql, will try direct execution:", error)

      // Execute the SQL directly
      const statements = sqlQuery.split(";").filter((stmt) => stmt.trim().length > 0)

      for (const stmt of statements) {
        try {
          // Try direct query execution
          const { error: stmtError } = await supabase.query(stmt)

          if (stmtError) {
            console.error("Error executing SQL statement:", stmtError)
            return NextResponse.json({ success: false, error: stmtError.message }, { status: 500 })
          }
        } catch (execError) {
          console.error("Exception executing SQL statement:", execError)
          return NextResponse.json(
            { success: false, error: execError instanceof Error ? execError.message : "Unknown error" },
            { status: 500 },
          )
        }
      }
    }

    return NextResponse.json({ success: true, message: "Roles tables created successfully" })
  } catch (error) {
    console.error("Exception in create-roles-tables:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
