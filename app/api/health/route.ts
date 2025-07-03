import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Test database connection
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("user_profiles").select("count").limit(1)

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: error ? "error" : "healthy",
        api: "healthy",
      },
      version: process.env.npm_package_version || "1.0.0",
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Service check failed",
      },
      { status: 500 },
    )
  }
}
