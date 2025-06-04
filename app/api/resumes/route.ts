import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"

// Create a Supabase client with the service role key
function createServiceRoleClient() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or service role key")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const isBase = url.searchParams.get("isBase") === "true"
    const jobId = url.searchParams.get("jobId")

    // Create Supabase server client
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get user ID from cookie
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      console.log("No user ID found in cookies")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`API: Fetching resumes for user ${userId}, isBase=${isBase}, jobId=${jobId || "none"}`)

    // Try a direct query first to check database connection
    try {
      const { count, error: countError } = await supabase
        .from("resumes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      if (countError) {
        console.error("Error checking resume count:", countError)
      } else {
        console.log(`Database connection test: Found ${count} total resumes for user ${userId}`)
      }
    } catch (testError) {
      console.error("Database connection test failed:", testError)
    }

    // Build the query based on parameters
    let query = supabase.from("resumes").select("*").eq("user_id", userId).order("created_at", { ascending: false })

    // Filter by job ID if provided
    if (jobId) {
      query = query.eq("job_id", jobId)
    }

    // Filter for base resumes if requested
    if (isBase) {
      query = query.is("job_id", null)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching resumes:", error)
      return NextResponse.json({ error: `Failed to fetch resumes: ${error.message}` }, { status: 500 })
    }

    console.log(`API: Found ${data?.length || 0} resumes for user ${userId}`)

    // Log the first resume to help with debugging
    if (data && data.length > 0) {
      console.log("First resume:", {
        id: data[0].id,
        name: data[0].name,
        user_id: data[0].user_id,
        created_at: data[0].created_at,
      })
    }

    // If we're looking for resumes for a specific job, also check the job_resumes table
    if (jobId && !isBase) {
      console.log(`Checking job_resumes table for additional resumes for job ${jobId}`)

      // Get resume IDs from job_resumes table - don't filter by user_id
      const { data: jobResumes, error: jobResumesError } = await supabase
        .from("job_resumes")
        .select("resume_id")
        .eq("job_id", jobId)

      if (jobResumesError) {
        console.error("Error fetching job_resumes:", jobResumesError)
        return NextResponse.json({ error: "Failed to fetch job_resumes" }, { status: 500 })
      }

      if (jobResumes && jobResumes.length > 0) {
        const resumeIds = jobResumes.map((jr) => jr.resume_id)
        console.log(`Found ${resumeIds.length} resume IDs in job_resumes table`)

        // Get the resumes - make sure to filter by user_id here
        const { data: associatedResumes, error: associatedResumesError } = await supabase
          .from("resumes")
          .select("*")
          .in("id", resumeIds)
          .eq("user_id", userId)

        if (associatedResumesError) {
          console.error("Error fetching associated resumes:", associatedResumesError)
          return NextResponse.json({ error: "Failed to fetch associated resumes" }, { status: 500 })
        }

        console.log(`Found ${associatedResumes?.length || 0} associated resumes`)

        // Combine both sets of resumes and remove duplicates
        if (associatedResumes && associatedResumes.length > 0) {
          const allResumes = [...(data || []), ...associatedResumes]
          const uniqueResumes = allResumes.filter(
            (resume, index, self) => index === self.findIndex((r) => r.id === resume.id),
          )

          console.log(`Returning ${uniqueResumes.length} unique resumes`)
          return NextResponse.json({ resumes: uniqueResumes })
        }
      }
    }

    return NextResponse.json({ resumes: data || [] })
  } catch (error) {
    console.error("Error in resumes API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST request to /api/resumes received")

    // Check content type
    const contentType = request.headers.get("content-type") || ""
    console.log("Content-Type:", contentType)

    // Always try to parse as FormData first for this endpoint
    let formData: FormData
    let name: string
    let content: string
    let jobId: string | null = null
    let parentResumeId: string | null = null
    let isAiGenerated = false
    let versionName: string | null = null
    let fileName: string | null = null
    let file: File | null = null

    try {
      formData = await request.formData()
      console.log("FormData keys:", [...formData.keys()])

      name = formData.get("name") as string
      content = formData.get("content") as string
      jobId = (formData.get("jobId") as string) || null
      parentResumeId = (formData.get("parentResumeId") as string) || null
      isAiGenerated = formData.get("isAiGenerated") === "true"
      versionName = (formData.get("versionName") as string) || null
      file = formData.get("file") as File | null

      if (file) {
        fileName = file.name
        console.log("File received:", file.name, file.type, file.size)

        // If no content was provided but we have a file, try to read it
        if (!content && file.type === "text/plain") {
          content = await file.text()
        }
      } else {
        fileName = `${name}.txt`
      }

      console.log("Extracted form data:", { name, jobId, isAiGenerated, fileName })
    } catch (formDataError) {
      console.error("Error parsing FormData:", formDataError)

      // If FormData parsing fails, try JSON as fallback
      try {
        const text = await request.text()
        console.log("Raw request body:", text)

        if (!text || text.trim() === "") {
          return NextResponse.json({ error: "Empty request body" }, { status: 400 })
        }

        const body = JSON.parse(text)
        name = body.name
        content = body.content
        jobId = body.jobId || null
        parentResumeId = body.parentResumeId || null
        isAiGenerated = body.isAiGenerated || false
        versionName = body.versionName || null
        fileName = body.fileName || `${name}.txt`
      } catch (jsonError) {
        console.error("Error parsing request body:", jsonError)
        return NextResponse.json(
          {
            error: "Failed to parse request body",
            details: jsonError instanceof Error ? jsonError.message : "Unknown parsing error",
          },
          { status: 400 },
        )
      }
    }

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 })
    }

    if (!content) {
      return NextResponse.json({ error: "Missing required field: content" }, { status: 400 })
    }

    // Create Supabase server client
    const cookieStore = cookies()

    // Get user ID from cookie
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      console.log("No user ID found in cookies")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`Creating resume for user ${userId}, job ${jobId || "none"}`)

    // Use the service role client to bypass RLS policies
    const supabaseAdmin = createServiceRoleClient()

    // Create resume
    const now = new Date().toISOString()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .insert({
        user_id: userId,
        name,
        file_name: fileName || `${name}.txt`,
        content,
        is_ai_generated: isAiGenerated || false,
        created_at: now,
        updated_at: now,
        expires_at: expiresAt.toISOString(),
        job_id: jobId || null,
        parent_resume_id: parentResumeId || null,
        version_name: versionName || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating resume:", error)
      return NextResponse.json({ error: `Failed to create resume: ${error.message}` }, { status: 500 })
    }

    // Update user to indicate they have a baseline resume
    await supabaseAdmin
      .from("users")
      .update({
        has_baseline_resume: true,
        updated_at: now,
      })
      .eq("id", userId)

    // If this resume is for a job, also create an entry in the job_resumes table
    if (jobId) {
      try {
        // Try inserting with user_id first
        const { error: withUserIdError } = await supabaseAdmin.from("job_resumes").insert({
          job_id: jobId,
          resume_id: data.id,
          user_id: userId,
          created_at: now,
        })

        // If there's an error that mentions the user_id column, try without it
        if (
          withUserIdError &&
          (withUserIdError.message.includes("user_id") ||
            withUserIdError.message.includes("column") ||
            withUserIdError.message.includes("schema"))
        ) {
          console.log("Falling back to insert without user_id column")

          // Try again without the user_id column
          const { error: withoutUserIdError } = await supabaseAdmin.from("job_resumes").insert({
            job_id: jobId,
            resume_id: data.id,
            created_at: now,
          })

          if (withoutUserIdError) {
            console.error("Error creating job_resume association without user_id:", withoutUserIdError)
            // Don't fail the request if this fails, just log it
          }
        } else if (withUserIdError) {
          console.error("Error creating job_resume association with user_id:", withUserIdError)
          // Don't fail the request if this fails, just log it
        }
      } catch (err) {
        console.error("Error in job_resume association logic:", err)

        // As a last resort, try the simplest possible insert
        try {
          await supabaseAdmin.from("job_resumes").insert({
            job_id: jobId,
            resume_id: data.id,
          })
        } catch (finalErr) {
          console.error("Final attempt to create job_resume association failed:", finalErr)
          // Don't fail the request if this fails, just log it
        }
      }
    }

    return NextResponse.json({ success: true, resume: data })
  } catch (error) {
    console.error("Error in create resume API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
