import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, jobDescription } = await request.json()

    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `Generate 5 relevant interview questions for a ${jobTitle} position. ${
      jobDescription ? `Job description: ${jobDescription}` : ""
    }

    Return the questions as a JSON array of strings. Focus on:
    - Technical skills relevant to the role
    - Problem-solving scenarios
    - Behavioral questions
    - Industry-specific challenges

    Format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse JSON from the response
    let questions
    try {
      // Extract JSON from the response if it's wrapped in markdown
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        questions = JSON.parse(text)
      }
    } catch (parseError) {
      // If JSON parsing fails, create questions from the text
      const lines = text.split("\n").filter((line) => line.trim())
      questions = lines.slice(0, 5).map((line) => line.replace(/^\d+\.\s*/, "").trim())
    }

    return NextResponse.json({
      success: true,
      questions: Array.isArray(questions) ? questions : [questions],
    })
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json(
      { error: `Gemini API error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
