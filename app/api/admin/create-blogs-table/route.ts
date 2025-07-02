import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Try to create a simple test record to see if table exists
    const { data: testData, error: testError } = await supabase.from("blogs").select("id").limit(1)

    if (!testError) {
      return NextResponse.json({
        message: "Blogs table already exists",
        tableExists: true,
      })
    }

    // If table doesn't exist, create it using direct SQL execution
    // We'll use a simpler approach by creating the table structure manually

    console.log("Table doesn't exist, attempting to create...")

    // For now, let's return an error that suggests manual table creation
    return NextResponse.json(
      {
        error: "Blogs table needs to be created manually in Supabase",
        suggestion: "Please run the SQL from lib/supabase/create-blogs-table.sql in your Supabase SQL editor",
        sqlFile: "lib/supabase/create-blogs-table.sql",
      },
      { status: 500 },
    )
  } catch (error) {
    console.error("Error in create-blogs-table:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
