import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Rate limiting
const rateLimit = new Map()

export async function POST(request: NextRequest) {
  try {
    // Simple rate limiting (3 requests per 10 minutes per IP)
    const ip = request.ip || "anonymous"
    const now = Date.now()
    const windowMs = 10 * 60 * 1000 // 10 minutes
    const maxRequests = 3

    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    } else {
      const limit = rateLimit.get(ip)
      if (now > limit.resetTime) {
        rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
      } else if (limit.count >= maxRequests) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
      } else {
        limit.count++
      }
    }

    const { jobTitle, jobDescription } = await request.json()

    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    // Create a comprehensive description if none provided
    let description = jobDescription
    if (!description || description.trim().length < 50) {
      description = `Job Title: ${jobTitle}

This is a professional ${jobTitle} position requiring relevant experience and skills. The role involves typical responsibilities associated with ${jobTitle} positions, including collaboration with team members, problem-solving, and contributing to organizational goals. Candidates should demonstrate strong communication skills, technical competency, and the ability to work in a fast-paced environment.`
    }

    // Ensure minimum length
    if (description.length < 50) {
      description +=
        " The ideal candidate will bring enthusiasm, dedication, and a commitment to excellence in their work."
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Generate 5 realistic interview questions for this job:

Job Title: ${jobTitle}
Job Description: ${description}

Please provide questions that are:
1. Relevant to the specific role
2. Professional and commonly asked
3. Mix of behavioral and technical questions
4. Appropriate difficulty level

Format as a JSON array of strings.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse JSON, fallback to manual parsing
    let questions
    try {
      questions = JSON.parse(text)
    } catch {
      // Fallback: extract questions manually
      const lines = text.split("\n").filter((line) => line.trim())
      questions = lines
        .filter((line) => line.includes("?"))
        .map((line) =>
          line
            .replace(/^\d+\.?\s*/, "")
            .replace(/^["[\]]/g, "")
            .replace(/["[\]],?$/g, "")
            .trim(),
        )
        .slice(0, 5)
    }

    // Ensure we have valid questions
    if (!Array.isArray(questions) || questions.length === 0) {
      questions = [
        `Tell me about your experience relevant to the ${jobTitle} role.`,
        `What interests you most about this ${jobTitle} position?`,
        `How do you handle challenging situations in your work?`,
        `Describe a time when you had to learn something new quickly.`,
        `Where do you see yourself in your career in the next few years?`,
      ]
    }

    return NextResponse.json({ questions: questions.slice(0, 5) })
  } catch (error) {
    console.error("Error generating questions:", error)

    // Fallback questions
    const fallbackQuestions = [
      "Tell me about yourself and your professional background.",
      "What interests you most about this position?",
      "How do you handle challenging situations at work?",
      "Describe a time when you had to work as part of a team.",
      "Where do you see yourself in your career in 5 years?",
    ]

    return NextResponse.json({
      questions: fallbackQuestions,
      note: "Generated using fallback questions due to service limitations.",
    })
  }
}
