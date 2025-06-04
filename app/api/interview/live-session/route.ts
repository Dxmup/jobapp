import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const cookieStore = cookies()

    // Get user from session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const userId = session?.user?.id || cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId, resumeId } = await request.json()

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Get resume if provided
    let resume = null
    if (resumeId) {
      const { data: resumeData } = await supabase
        .from("resumes")
        .select("content, text_content")
        .eq("id", resumeId)
        .eq("user_id", userId)
        .single()

      resume = resumeData
    }

    // Get saved interview questions
    const questionsKey = `interview_questions/${userId}/${jobId}${resumeId ? `/${resumeId}` : ""}`

    let questions = { technical: [], behavioral: [] }
    try {
      const { data: questionsData } = await supabase.storage.from("user_data").download(questionsKey)

      if (questionsData) {
        const text = await questionsData.text()
        const questionData = JSON.parse(text)
        questions = {
          technical: questionData.technical_questions || [],
          behavioral: questionData.behavioral_questions || [],
        }
      }
    } catch (error) {
      console.log("No saved questions found, using empty arrays")
    }

    // Return the configuration for the Live API session
    return NextResponse.json({
      success: true,
      config: {
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description || "",
        resume: resume?.content || resume?.text_content || "",
        questions,
      },
    })
  } catch (error) {
    console.error("Error setting up live session:", error)
    return NextResponse.json({ error: "Failed to setup live session" }, { status: 500 })
  }
}
