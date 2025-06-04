import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { customizeResumeWithGemini } from "@/lib/gemini-resume-customizer"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "You must be logged in to customize a resume" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const { resumeContent, jobDescription, customInstructions } = body

    if (!resumeContent || !jobDescription) {
      return NextResponse.json({ error: "Resume content and job description are required" }, { status: 400 })
    }

    // Use the existing function from lib
    const customizedResume = await customizeResumeWithGemini(resumeContent, jobDescription, customInstructions || "")

    return NextResponse.json({ customizedResume })
  } catch (error) {
    console.error("Error customizing resume:", error)
    return NextResponse.json({ error: "Failed to customize resume" }, { status: 500 })
  }
}
