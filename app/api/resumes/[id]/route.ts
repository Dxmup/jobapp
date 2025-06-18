import { NextResponse } from "next/server"
import { requireRouteAuthenticatedUserId } from "@/lib/auth-helpers"
import { createRouteClient } from "@/lib/supabase/authClient"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const resumeId = params.id

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(resumeId)) {
      return NextResponse.json({ success: false, error: "Invalid resume ID format" }, { status: 400 })
    }

    // Single source of truth for authentication
    const userId = await requireRouteAuthenticatedUserId()
    const supabase = createRouteClient()

    console.log(`Fetching resume ${resumeId} for authenticated user: ${userId}`)

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

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

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

    // Single source of truth for authentication
    const userId = await requireRouteAuthenticatedUserId()
    const supabase = createRouteClient()

    const { name, content } = body

    if (!name || !content) {
      return NextResponse.json({ success: false, error: "Name and content are required" }, { status: 400 })
    }

    console.log(`Updating resume ${resumeId} for authenticated user: ${userId}`)

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

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

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

    // Single source of truth for authentication
    const userId = await requireRouteAuthenticatedUserId()
    const supabase = createRouteClient()

    console.log(`Deleting resume ${resumeId} for authenticated user: ${userId}`)

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

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

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
