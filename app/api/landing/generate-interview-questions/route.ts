import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, jobDescription } = await request.json()

    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `Generate 5 interview questions for a ${jobTitle} position. ${
      jobDescription ? `Job description: ${jobDescription}` : ""
    }

    Return as JSON array: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    let questions
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      questions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
    } catch {
      questions = [
        "Tell me about yourself and your background.",
        "Why are you interested in this position?",
        "What are your greatest strengths?",
        "Describe a challenging situation you faced.",
        "Where do you see yourself in 5 years?",
      ]
    }

    return NextResponse.json({ success: true, questions })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
