import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Read the SQL file
    const sqlPath = join(process.cwd(), "scripts", "create-waitlist-table.sql")
    const sql = readFileSync(sqlPath, "utf8")

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error creating waitlist table:", error)
      return NextResponse.json({ error: "Failed to create waitlist table", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Waitlist table created successfully",
    })
  } catch (error) {
    console.error("Exception creating waitlist table:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
