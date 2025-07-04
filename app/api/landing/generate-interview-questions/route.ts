import { type NextRequest, NextResponse } from "next/server"

const rateLimit = new Map()

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || "anonymous"
    const now = Date.now()
    const windowMs = 10 * 60 * 1000 // 10 minutes
    const maxRequests = 3

    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, { count: 0, resetTime: now + windowMs })
    }

    const userLimit = rateLimit.get(ip)
    if (now > userLimit.resetTime) {
      userLimit.count = 0
      userLimit.resetTime = now + windowMs
    }

    if (userLimit.count >= maxRequests) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    userLimit.count++

    const { jobTitle, jobDescription } = await request.json()

    if (!jobTitle || jobTitle.trim().length === 0) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    let description = jobDescription || ""
    if (!description || description.trim().length < 50) {
      description = `Job Title: ${jobTitle}. This is a professional ${jobTitle} position requiring relevant experience and skills. The role involves typical responsibilities associated with ${jobTitle} positions in the industry, including collaboration with team members, problem-solving, and contributing to organizational goals.`
    }

    if (description.length < 50) {
      description +=
        " The candidate should demonstrate strong communication skills, attention to detail, and the ability to work effectively in a team environment."
    }

    // Use Gemini API
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      console.error("GOOGLE_AI_API_KEY not configured")
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 })
    }

    const prompt = `Generate 5 realistic interview questions for this job:

Job Title: ${jobTitle}
Job Description: ${description}

Requirements:
- Questions should be specific to this role
- Mix of behavioral, technical, and situational questions
- Professional and realistic
- Return as a JSON array of strings

Example format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error("No response from AI")
    }

    try {
      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
      const questions = JSON.parse(cleanText)

      if (Array.isArray(questions) && questions.length > 0) {
        return NextResponse.json({ questions })
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
    }

    const fallbackQuestions = [
      `Tell me about your experience with ${jobTitle} responsibilities.`,
      `How do you handle challenging situations in your work?`,
      `What interests you most about this ${jobTitle} position?`,
      `Describe a time when you had to learn something new quickly.`,
      `How do you prioritize tasks when you have multiple deadlines?`,
    ]

    return NextResponse.json({ questions: fallbackQuestions })
  } catch (error) {
    console.error("Error generating questions:", error)

    const fallbackQuestions = [
      "Tell me about yourself and your background.",
      "Why are you interested in this position?",
      "What are your greatest strengths?",
      "Describe a challenging situation you've faced and how you handled it.",
      "Where do you see yourself in five years?",
    ]

    return NextResponse.json({ questions: fallbackQuestions })
  }
}
