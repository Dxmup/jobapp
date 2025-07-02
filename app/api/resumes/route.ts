import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
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

    // Query resumes for the user
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error fetching resumes:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch resumes from database",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`Successfully fetched ${resumes?.length || 0} resumes for user ${userId}`)

    return NextResponse.json({
      success: true,
      resumes: resumes || [],
      count: resumes?.length || 0,
    })
  } catch (error) {
    console.error("Unexpected error in resumes API:", error)
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

export async function POST(request: Request) {
  try {
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
      // Fallback to cookie
      userId = cookieStore.get("user_id")?.value
      if (!userId) {
        return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
      }
    }

    const body = await request.json()
    console.log("Received resume creation request:", body)

    const { name, content, fileName, fileUrl, jobId, parentResumeId, isAiGenerated, versionName, jobTitle, company } =
      body

    // Validate required fields
    if (!name || !content) {
      return NextResponse.json({ success: false, error: "Name and content are required" }, { status: 400 })
    }

    const now = new Date().toISOString()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // If jobId is provided, get job details
    let jobDetails = null
    if (jobId) {
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("title, company")
        .eq("id", jobId)
        .eq("user_id", userId)
        .single()

      if (jobError) {
        console.error("Error fetching job details:", jobError)
        return NextResponse.json({ success: false, error: "Job not found or access denied" }, { status: 403 })
      }
      jobDetails = job
    }

    // Create the resume
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        user_id: userId,
        name,
        content,
        file_name: fileName || `${name.replace(/\s+/g, "-").toLowerCase()}.txt`,
        file_url: fileUrl || null,
        is_ai_generated: isAiGenerated || false,
        created_at: now,
        updated_at: now,
        expires_at: expiresAt.toISOString(),
        job_id: jobId || null,
        parent_resume_id: parentResumeId || null,
        version_name: versionName || null,
        job_title: jobDetails?.title || jobTitle || null,
        company: jobDetails?.company || company || null,
      })
      .select()
      .single()

    if (resumeError) {
      console.error("Error creating resume:", resumeError)
      return NextResponse.json(
        { success: false, error: "Failed to create resume", details: resumeError.message },
        { status: 500 },
      )
    }

    console.log("Resume created successfully:", resume.id)

    // If jobId is provided, create job-resume association
    if (jobId) {
      console.log("Creating job-resume association...")

      // Check if association already exists
      const { data: existingAssoc } = await supabase
        .from("job_resumes")
        .select("id")
        .eq("job_id", jobId)
        .eq("resume_id", resume.id)
        .single()

      if (!existingAssoc) {
        const { error: associationError } = await supabase.from("job_resumes").insert({
          job_id: jobId,
          resume_id: resume.id,
          user_id: userId,
          created_at: now,
        })

        if (associationError) {
          console.error("Error creating job-resume association:", associationError)
          // Don't fail the whole operation, just log the error
          console.log("Resume created but job association failed")
        } else {
          console.log("Job-resume association created successfully")
        }
      } else {
        console.log("Job-resume association already exists")
      }
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
      message: "Resume created successfully",
    })
  } catch (error) {
    console.error("Unexpected error creating resume:", error)
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
