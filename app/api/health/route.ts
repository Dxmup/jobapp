import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Check database connection
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("user_profiles").select("count").limit(1)

    if (error && !error.message.includes('relation "user_profiles" does not exist')) {
      throw error
    }

    // Check environment variables
    const requiredEnvs = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "GOOGLE_AI_API_KEY",
    ]

    const missingEnvs = requiredEnvs.filter((env) => !process.env[env])

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: error ? "not_initialized" : "connected",
      environment: {
        missing_variables: missingEnvs,
        has_stripe: !!process.env.STRIPE_SECRET_KEY,
        has_admin_email: !!process.env.ADMIN_EMAIL,
      },
      version: "1.0.0",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
