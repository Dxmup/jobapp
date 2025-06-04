import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/types/database"

/**
 * Endpoint that reuses the successful logic from the /jobs Resume section
 * to populate the dropdown in the customize-resume page
 */
export async function GET() {
  try {
    // Get the user session using the same approach as the working endpoint
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("Fetching resumes for user ID:", userId)

    // Use the same query approach that's working in the /jobs Resume section
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching resumes:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log(`Found ${resumes?.length || 0} resumes for user ${userId}`)

    return NextResponse.json({
      success: true,
      resumes: resumes || [],
    })
  } catch (error) {
    console.error("Error in for-dropdown API:", error)
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
