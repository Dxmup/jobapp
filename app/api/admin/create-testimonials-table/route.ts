import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if user is admin
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Read and execute the SQL file
    const sqlPath = join(process.cwd(), "lib/supabase/create-testimonials-table.sql")
    const sql = readFileSync(sqlPath, "utf8")

    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error creating testimonials table:", error)
      return NextResponse.json({ error: "Failed to create testimonials table" }, { status: 500 })
    }

    return NextResponse.json({ message: "Testimonials table created successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
