import { type NextRequest, NextResponse } from "next/server"
import { getInterviewQuestions } from "@/app/actions/interview-prep-actions"

export async function POST(request: NextRequest) {
  try {
    const { jobId, resumeId, questions, jobDescription, resumeContent } = await request.json()

    // Validate required fields
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google AI API key not configured" }, { status: 500 })
    }

    // If questions are provided, use them directly
    let interviewQuestions = questions

    // If no questions provided, try to fetch them from the database
    if (!questions || (!questions.technical?.length && !questions.behavioral?.length)) {
      try {
        const result = await getInterviewQuestions(jobId, resumeId)
        if (result.success && result.questions) {
          interviewQuestions = result.questions
        }
      } catch (error) {
        console.error("Error fetching interview questions:", error)
        // Continue with empty questions if fetch fails
        interviewQuestions = { technical: [], behavioral: [] }
      }
    }

    // Ensure questions are properly formatted
    const formattedQuestions = {
      technical: interviewQuestions.technical ? interviewQuestions.technical.map(formatQuestion) : [],
      behavioral: interviewQuestions.behavioral ? interviewQuestions.behavioral.map(formatQuestion) : [],
    }

    // Create session data
    const sessionData = {
      jobId,
      resumeId,
      questions: formattedQuestions,
      jobDescription,
      resumeContent,
    }

    return NextResponse.json({
      success: true,
      apiKey,
      sessionData,
    })
  } catch (error) {
    console.error("Error starting live session:", error)
    return NextResponse.json(
      {
        error: "Failed to start live session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Function to format questions for better clarity
function formatQuestion(question: string): string {
  // Remove any existing numbering
  let formatted = question.replace(/^\d+[.)]\s*/, "").trim()

  // Ensure the question ends with a question mark
  if (!formatted.endsWith("?")) {
    formatted += "?"
  }

  // Ensure proper capitalization
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1)

  return formatted
}
