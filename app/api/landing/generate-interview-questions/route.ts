import { type NextRequest, NextResponse } from "next/server"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, jobDescription } = await request.json()

    console.log("Received request:", { jobTitle, jobDescription })

    if (!jobTitle) {
      console.error("Job title is missing")
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("Google AI API key is missing")
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    console.log("Making Gemini API call...")

    const prompt = `Generate 5 common interview questions for a ${jobTitle} position. ${
      jobDescription ? `Job description: ${jobDescription}` : ""
    }

    Return the questions as a JSON array of strings. Each question should be relevant to the role and commonly asked in interviews.

    Example format:
    ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`

    const { text } = await generateText({
      model: google("gemini-1.5-pro"),
      prompt,
    })

    console.log("Gemini API response:", text)

    // Try to parse the response as JSON
    let questions
    try {
      questions = JSON.parse(text)
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError)
      // Fallback: extract questions from text
      const lines = text.split("\n").filter((line) => line.trim().length > 0)
      questions = lines.slice(0, 5).map((line) => line.replace(/^\d+\.\s*/, "").replace(/^[-*]\s*/, ""))
    }

    if (!Array.isArray(questions)) {
      console.error("Questions is not an array:", questions)
      return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
    }

    console.log("Generated questions:", questions)

    return NextResponse.json({
      success: true,
      questions: questions.slice(0, 5),
    })
  } catch (error: any) {
    console.error("Gemini API error:", error)

    if (error.message?.includes("404")) {
      return NextResponse.json({ error: "Gemini API error: Model not found" }, { status: 500 })
    }

    return NextResponse.json({ error: `Gemini API error: ${error.message || "Unknown error"}` }, { status: 500 })
  }
}
