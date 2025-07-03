import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getCurrentUserId } from "@/lib/auth-cookie"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { resumeContent, feedback } = await request.json()

    if (!resumeContent || !feedback) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Please revise the following resume based on the provided feedback:

Current Resume:
${resumeContent}

Feedback to Address:
${feedback}

Please provide:
1. A revised version of the resume that addresses the feedback
2. A list of specific changes made

Return the response in JSON format:
{
  "revisedResume": "the improved resume content",
  "changes": ["list of specific changes made"]
}
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    try {
      const parsedResponse = JSON.parse(response)
      return NextResponse.json(parsedResponse)
    } catch {
      // If JSON parsing fails, return a structured response
      return NextResponse.json({
        revisedResume: response,
        changes: ["Resume revised based on provided feedback"],
      })
    }
  } catch (error) {
    console.error("Error revising resume:", error)
    return NextResponse.json({ error: "Failed to revise resume" }, { status: 500 })
  }
}
