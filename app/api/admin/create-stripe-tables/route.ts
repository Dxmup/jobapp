import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "lib", "supabase", "create-stripe-tables.sql")
    const sql = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("Error creating Stripe tables:", error)
      return NextResponse.json({ error: "Failed to create Stripe tables" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in create-stripe-tables:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
