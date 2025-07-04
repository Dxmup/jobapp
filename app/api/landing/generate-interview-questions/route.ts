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

    Return the questions as a JSON array of objects with this format:
    [
      {
        "question": "Tell me about a time when...",
        "category": "Behavioral"
      }
    ]

    Categories should be one of: Behavioral, Technical, Situational, Company Culture, or Role-Specific.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse JSON from the response
    let questions
    try {
      // Extract JSON from the response (remove any markdown formatting)
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: create questions from plain text
        const lines = text.split("\n").filter((line) => line.trim())
        questions = lines.slice(0, 5).map((line, index) => ({
          question: line.replace(/^\d+\.?\s*/, "").trim(),
          category: "General",
        }))
      }
    } catch (parseError) {
      console.error("Failed to parse questions:", parseError)
      // Fallback questions
      questions = [
        { question: "Tell me about yourself and your background.", category: "General" },
        { question: "Why are you interested in this position?", category: "Role-Specific" },
        { question: "What are your greatest strengths?", category: "Behavioral" },
        { question: "Describe a challenging situation you faced and how you handled it.", category: "Situational" },
        { question: "Where do you see yourself in 5 years?", category: "Company Culture" },
      ]
    }

    return NextResponse.json({
      success: true,
      questions: questions.slice(0, 5), // Ensure we only return 5 questions
    })
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json(
      { error: `Gemini API error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
