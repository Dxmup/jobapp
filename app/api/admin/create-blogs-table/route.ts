import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Read the SQL file
    const sqlPath = join(process.cwd(), "lib/supabase/create-blogs-table.sql")
    const sql = readFileSync(sqlPath, "utf8")

    // Execute the SQL
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error creating blogs table:", error)
      return NextResponse.json({ error: "Failed to create blogs table", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "Blogs table created successfully",
      data,
    })
  } catch (error) {
    console.error("Error in create-blogs-table:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
