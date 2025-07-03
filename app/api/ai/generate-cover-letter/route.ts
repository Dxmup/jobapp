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

    const { jobTitle, company, jobDescription, resumeContent } = await request.json()

    if (!jobTitle || !company || !resumeContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Create a professional cover letter based on the following information:

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription || "Not provided"}

Resume Content:
${resumeContent}

Please write a compelling cover letter that:
1. Addresses the specific role and company
2. Highlights relevant experience from the resume
3. Shows enthusiasm for the position
4. Is professional and well-structured
5. Is approximately 3-4 paragraphs long

Format the response as a clean, professional cover letter without any markdown formatting.
`

    const result = await model.generateContent(prompt)
    const coverLetter = result.response.text()

    return NextResponse.json({ coverLetter })
  } catch (error) {
    console.error("Error generating cover letter:", error)
    return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 })
  }
}
