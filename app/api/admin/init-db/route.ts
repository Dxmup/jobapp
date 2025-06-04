import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/supabase/init-db"

export async function POST() {
  try {
    await initializeDatabase()
    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ success: false, error: "Failed to initialize database" }, { status: 500 })
  }
}
