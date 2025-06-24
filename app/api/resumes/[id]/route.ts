import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const resumeId = params.id

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(resumeId)) {
      return NextResponse.json({ success: false, error: "Invalid resume ID format" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerSupabaseClient()

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    let userId = null

    if (session && !sessionError) {
      userId = session.user.id
      console.log("Found valid Supabase session for user:", userId)
    } else {
      // Fallback to cookie
      userId = cookieStore.get("user_id")?.value
      console.log("No Supabase session, trying cookie user ID:", userId)

      if (!userId) {
        console.error("No authentication found - no session and no user ID cookie")
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required. Please log in again.",
            details: "No valid session or user ID found",
          },
          { status: 401 },
        )
      }
    }

    // Fetch the resume
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 })
      }
      console.error("Error fetching resume:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch resume", details: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        userId: resume.user_id,
        name: resume.name,
        fileName: resume.file_name,
        fileUrl: resume.file_url,
        content: resume.content,
        isAiGenerated: resume.is_ai_generated,
        createdAt: resume.created_at,
        updatedAt: resume.updated_at,
        expiresAt: resume.expires_at,
        jobId: resume.job_id,
        parentResumeId: resume.parent_resume_id,
        versionName: resume.version_name,
        jobTitle: resume.job_title,
        company: resume.company,
      },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const resumeId = params.id
    const body = await request.json()

    const cookieStore = cookies()
    const supabase = createServerSupabaseClient()

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    let userId = null

    if (session && !sessionError) {
      userId = session.user.id
    } else {
      userId = cookieStore.get("user_id")?.value
      if (!userId) {
        return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
      }
    }

    const { name, content } = body

    if (!name || !content) {
      return NextResponse.json({ success: false, error: "Name and content are required" }, { status: 400 })
    }

    const { data: resume, error } = await supabase
      .from("resumes")
      .update({
        name,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating resume:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update resume", details: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        userId: resume.user_id,
        name: resume.name,
        fileName: resume.file_name,
        fileUrl: resume.file_url,
        content: resume.content,
        isAiGenerated: resume.is_ai_generated,
        createdAt: resume.created_at,
        updatedAt: resume.updated_at,
        expiresAt: resume.expires_at,
        jobId: resume.job_id,
        parentResumeId: resume.parent_resume_id,
        versionName: resume.version_name,
        jobTitle: resume.job_title,
        company: resume.company,
      },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const resumeId = params.id

    const cookieStore = cookies()
    const supabase = createServerSupabaseClient()

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    let userId = null

    if (session && !sessionError) {
      userId = session.user.id
    } else {
      userId = cookieStore.get("user_id")?.value
      if (!userId) {
        return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
      }
    }

    // First, delete any job associations
    await supabase.from("job_resumes").delete().eq("resume_id", resumeId)

    // Then delete the resume
    const { error } = await supabase.from("resumes").delete().eq("id", resumeId).eq("user_id", userId)

    if (error) {
      console.error("Error deleting resume:", error)
      return NextResponse.json(
        { success: false, error: "Failed to delete resume", details: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    })
  } catch (error) {
    console.error("Unexpected error:", error)
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
