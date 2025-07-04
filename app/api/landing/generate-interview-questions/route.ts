import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, jobDescription, experience } = await request.json()

    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `Generate 5 realistic interview questions for a ${jobTitle} position. 
    ${jobDescription ? `Job Description: ${jobDescription}` : ""}
    ${experience ? `Experience Level: ${experience}` : ""}
    
    Return the questions as a JSON array of strings. Only return the JSON array, no other text.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      const questions = JSON.parse(text)
      return NextResponse.json({ success: true, questions })
    } catch (parseError) {
      // If JSON parsing fails, try to extract questions from text
      const lines = text.split("\n").filter((line) => line.trim().length > 0)
      const questions = lines.slice(0, 5).map((line) => line.replace(/^\d+\.\s*/, "").trim())
      return NextResponse.json({ success: true, questions })
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json(
      {
        error: `Gemini API error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
