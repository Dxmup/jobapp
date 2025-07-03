import { type NextRequest, NextResponse } from "next/server"
import {
  getClientIP,
  checkEnhancedRateLimit,
  validateJobDescription,
  sanitizeInput,
  detectAbusePatterns,
} from "@/lib/security-utils"

export async function POST(request: NextRequest) {
  console.log("🎯 Interview questions API called")

  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request)

    // Strict rate limiting for AI endpoints
    const rateLimit = checkEnhancedRateLimit(clientIP, "interview-questions", "strict")

    if (!rateLimit.success) {
      console.log("❌ Rate limit exceeded for:", clientIP)
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          resetTime: rateLimit.resetTime,
        },
        { status: 429 },
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error("❌ Failed to parse request body:", e)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
        },
        { status: 400 },
      )
    }

    // Sanitize inputs
    const jobDescription = sanitizeInput(body.jobDescription, 10000)
    const role = sanitizeInput(body.role, 200)
    const experience = sanitizeInput(body.experience, 100)

    // Validate job description
    const validation = validateJobDescription(jobDescription)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 },
      )
    }

    // Check for abuse patterns
    const abuseCheck = detectAbusePatterns(jobDescription)
    if (abuseCheck.suspicious) {
      console.log("Suspicious content detected:", abuseCheck.reasons)
      return NextResponse.json(
        {
          success: false,
          error: "Content appears to be invalid. Please provide a genuine job description.",
        },
        { status: 400 },
      )
    }

    // Check API key
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      console.error("❌ GOOGLE_AI_API_KEY not configured")
      return NextResponse.json(
        {
          success: false,
          error: "AI service is not configured",
        },
        { status: 500 },
      )
    }

    console.log("📝 Generating questions for role:", role || "general position")

    // Create prompt
    const prompt = `You are an experienced hiring manager. Generate exactly 5 interview questions for this job.

Job Description: ${jobDescription}

Role: ${role || "the position"}
Experience Level: ${experience || "entry to mid-level"}

Return only a JSON object in this exact format:
{
  "questions": [
    "Question 1",
    "Question 2", 
    "Question 3",
    "Question 4",
    "Question 5"
  ]
}

Make questions specific to the role and appropriate for the experience level. Return only the JSON, no other text.`

    // Call Gemini API
    const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent"

    console.log("🚀 Calling Gemini API...")

    let response
    try {
      response = await fetch(apiUrl, {
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
            maxOutputTokens: 1024,
          },
        }),
      })
    } catch (fetchError) {
      console.error("❌ Network error calling Gemini:", fetchError)
      return NextResponse.json(
        {
          success: false,
          error: "Network error. Please try again.",
        },
        { status: 500 },
      )
    }

    console.log("📡 Gemini response status:", response.status)

    if (!response.ok) {
      console.error("❌ Gemini API error:", response.status, response.statusText)
      return NextResponse.json(
        {
          success: false,
          error: "AI service error. Please try again.",
        },
        { status: 500 },
      )
    }

    // Parse Gemini response
    let data
    try {
      data = await response.json()
    } catch (e) {
      console.error("❌ Failed to parse Gemini response:", e)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid AI response. Please try again.",
        },
        { status: 500 },
      )
    }

    // Extract content
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("❌ Invalid Gemini response structure:", data)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid AI response format. Please try again.",
        },
        { status: 500 },
      )
    }

    const responseText = data.candidates[0].content.parts[0].text
    console.log("📄 AI response length:", responseText.length)

    // Parse questions
    try {
      // Clean response
      const cleanText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()

      const result = JSON.parse(cleanText)

      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error("Questions array not found")
      }

      if (result.questions.length === 0) {
        throw new Error("No questions generated")
      }

      console.log("✅ Generated", result.questions.length, "questions")

      return NextResponse.json({
        success: true,
        questions: result.questions,
      })
    } catch (parseError) {
      console.error("❌ Failed to parse questions:", parseError)
      console.log("📄 Raw response:", responseText)

      // Fallback: create sample questions
      const fallbackQuestions = [
        "Tell me about your experience with the key responsibilities mentioned in this role.",
        "How would you approach the main challenges described in this position?",
        "What specific skills do you have that make you a good fit for this role?",
        "Can you describe a time when you successfully handled a similar responsibility?",
        "What questions do you have about this position and our company?",
      ]

      console.log("🔄 Using fallback questions")

      return NextResponse.json({
        success: true,
        questions: fallbackQuestions,
      })
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error. Please try again.",
      },
      { status: 500 },
    )
  }
}
