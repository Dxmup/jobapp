import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

/**
 * Ultra-simple endpoint that directly queries the resumes table
 * using the exact same approach as the working endpoint
 */
export async function GET() {
  try {
    // Get Supabase URL and key from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: "Supabase configuration missing" }, { status: 500 })
    }

    // Create a direct Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user ID from cookie
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 })
    }

    console.log("Fetching resumes with user ID:", userId)

    // Direct query to the resumes table
    const { data: resumes, error } = await supabase.from("resumes").select("*").eq("user_id", userId)

    if (error) {
      console.error("Error fetching resumes:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log(`Found ${resumes?.length || 0} resumes for user ${userId}`)

    // Return the resumes
    return NextResponse.json({
      success: true,
      resumes: resumes || [],
    })
  } catch (error) {
    console.error("Error in resumes/list API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
