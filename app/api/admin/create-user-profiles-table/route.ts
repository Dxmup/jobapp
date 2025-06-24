import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Read the SQL file
    const sqlPath = join(process.cwd(), "lib/supabase/create-user-profiles-table.sql")
    const sql = readFileSync(sqlPath, "utf8")

    // Execute the SQL
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error creating user_profiles table:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "User profiles table created successfully",
      data,
    })
  } catch (error) {
    console.error("Error in create-user-profiles-table API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
