import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import addUserIdToJobResumesSQL from "@/lib/supabase/add-user-id-to-job-resumes.sql"

export async function GET(request: Request) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "This endpoint is only available in development mode" }, { status: 403 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Execute the SQL to add user_id to job_resumes table
    const { error } = await supabase.rpc("exec_sql", { sql: addUserIdToJobResumesSQL })

    if (error) {
      console.error("Error executing SQL:", error)
      return NextResponse.json({ error: "Failed to update job_resumes table" }, { status: 500 })
    }

    // Count the updated records
    const { data: count, error: countError } = await supabase
      .from("job_resumes")
      .select("id", { count: "exact" })
      .not("user_id", "is", null)

    if (countError) {
      console.error("Error counting updated records:", countError)
      return NextResponse.json({ error: "Failed to count updated records" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully updated job_resumes table",
      updatedRecords: count,
    })
  } catch (error) {
    console.error("Error in fix-job-resumes API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
