import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import calendarTokensSQL from "@/lib/supabase/create-calendar-tokens-table.sql"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if user is admin
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", session.user.id)
      .single()

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Execute the SQL to create the table
    const { error } = await supabase.rpc("exec_sql", { sql_query: calendarTokensSQL })

    if (error) {
      console.error("Error creating calendar tokens table:", error)
      return NextResponse.json({ error: "Failed to create table" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Calendar tokens table created successfully" })
  } catch (error) {
    console.error("Error in create calendar tokens table API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
