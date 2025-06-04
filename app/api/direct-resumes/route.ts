/**
 * Direct Resumes API Route
 *
 * This API route provides direct access to the user's resumes by bypassing
 * Row Level Security (RLS) policies. It uses the Supabase service role key
 * to ensure reliable access to resume data even when RLS policies might
 * be misconfigured or causing issues.
 *
 * @route GET /api/direct-resumes
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"

/**
 * GET handler for the direct-resumes API route.
 *
 * Retrieves all resumes for the authenticated user directly from the database,
 * bypassing RLS policies.
 *
 * @returns NextResponse with the user's resumes or an error
 */
export async function GET() {
  try {
    // Get user ID from cookie
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      console.log("No user ID found in cookies")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create a direct Supabase client with service role to bypass RLS
    const supabaseUrl = process.env.SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase URL or service role key")
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Direct query to the resumes table
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching resumes:", error)
      return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
    }

    console.log(`Direct API: Found ${resumes?.length || 0} resumes for user ${userId}`)

    return NextResponse.json({
      success: true,
      resumes: resumes || [],
    })
  } catch (error) {
    console.error("Error in direct-resumes API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
