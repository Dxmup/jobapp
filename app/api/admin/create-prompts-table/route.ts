import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const adminCheck = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/check-admin`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    })

    if (!adminCheck.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Read the SQL file
    const sqlPath = join(process.cwd(), "scripts", "create-prompts-table.sql")
    const sql = readFileSync(sqlPath, "utf8")

    // Execute the SQL
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Prompts table created successfully",
      data,
    })
  } catch (error) {
    console.error("Error creating prompts table:", error)
    return NextResponse.json({ error: "Failed to create prompts table" }, { status: 500 })
  }
}
