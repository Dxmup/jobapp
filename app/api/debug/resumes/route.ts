import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get user ID from cookie
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json(
        {
          error: "No user ID found in cookies",
          cookies: cookieStore.getAll().map((c) => c.name),
        },
        { status: 401 },
      )
    }

    // Try to get a count of resumes
    const { count, error: countError } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (countError) {
      return NextResponse.json(
        {
          error: "Error counting resumes",
          details: countError.message,
          userId,
        },
        { status: 500 },
      )
    }

    // Get a sample of resumes (first 5)
    const { data: sampleResumes, error: sampleError } = await supabase
      .from("resumes")
      .select("id, name, user_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (sampleError) {
      return NextResponse.json(
        {
          error: "Error fetching sample resumes",
          details: sampleError.message,
          count,
          userId,
        },
        { status: 500 },
      )
    }

    // Try a direct SQL query as a last resort
    let directQueryResult = null
    try {
      const { data: directData, error: directError } = await supabase.rpc("get_user_resumes_count", {
        user_id_param: userId,
      })

      if (!directError) {
        directQueryResult = directData
      }
    } catch (directQueryError) {
      console.error("Direct query error:", directQueryError)
    }

    return NextResponse.json({
      success: true,
      userId,
      count,
      sampleResumes: sampleResumes || [],
      directQueryResult,
    })
  } catch (error) {
    console.error("Error in resumes debug API:", error)
    return NextResponse.json(
      {
        error: "Failed to debug resumes",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
