import { type NextRequest, NextResponse } from "next/server"

// Simple rate limiting without external dependencies
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 minutes
  const maxRequests = 3

  const entry = rateLimitMap.get(identifier)

  // Reset if window expired
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  // Check limit
  if (entry.count >= maxRequests) {
    return false
  }

  // Increment
  entry.count++
  rateLimitMap.set(identifier, entry)
  return true
}

export async function POST(request: NextRequest) {
  console.log("🎯 Interview questions API called")

  try {
    // Rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous"

    if (!checkRateLimit(clientIP)) {
      console.log("❌ Rate limit exceeded for:", clientIP)
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
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

    const { jobDescription, role, experience } = body

    // Validation
    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Job description is required",
        },
        { status: 400 },
      )
    }

    if (jobDescription.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description must be at least 50 characters",
        },
        { status: 400 },
      )
    }

    if (jobDescription.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description must be less than 5000 characters",
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

    // Prepare data
    const sanitizedJobDescription = jobDescription.trim()
    const sanitizedRole = role?.trim() || "the position"
    const sanitizedExperience = experience?.trim() || "entry to mid-level"

    console.log("📝 Generating questions for role:", sanitizedRole)

    // Create prompt
    const prompt = `You are an experienced hiring manager. Generate exactly 5 interview questions for this job.

Job Description: ${sanitizedJobDescription}

Role: ${sanitizedRole}
Experience Level: ${sanitizedExperience}

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
