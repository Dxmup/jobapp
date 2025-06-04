import { type NextRequest, NextResponse } from "next/server"
import { customizeResumeWithGemini } from "@/lib/gemini-resume-customizer"

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription, instructions } = await request.json()

    if (!resume || !jobDescription) {
      return NextResponse.json({ error: "Resume and job description are required" }, { status: 400 })
    }

    const customizedResume = await customizeResumeWithGemini(resume, jobDescription, instructions)

    return NextResponse.json({ customizedResume })
  } catch (error) {
    console.error("Error testing Gemini resume customization:", error)
    return NextResponse.json(
      {
        error: `Failed to test Gemini resume customization: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
