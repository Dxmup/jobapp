import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "lib", "supabase", "create-permissions-tables.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL query
    const { error } = await supabase.query(sqlQuery)

    if (error) {
      console.error("Error creating permissions tables:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Permissions tables created successfully" })
  } catch (error) {
    console.error("Error in create-permissions-tables route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
