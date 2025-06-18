import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "lib", "supabase", "create-exec-sql-function.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL directly
    const statements = sqlQuery.split(";").filter((stmt) => stmt.trim().length > 0)

    for (const stmt of statements) {
      try {
        // Try direct query execution
        const { error } = await supabase.query(stmt)

        if (error) {
          console.error("Error executing SQL statement:", error)
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }
      } catch (execError) {
        console.error("Exception executing SQL statement:", execError)
        return NextResponse.json(
          { success: false, error: execError instanceof Error ? execError.message : "Unknown error" },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ success: true, message: "exec_sql function created successfully" })
  } catch (error) {
    console.error("Exception in create-exec-sql-function:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
