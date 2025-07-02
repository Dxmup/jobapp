import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  console.log("Cover letter generation API called")

  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : (request.ip ?? "127.0.0.1")

    console.log("Client IP:", ip)

    // Rate limiting - 3 requests per 10 minutes
    const rateLimit = checkRateLimit(ip, "cover-letter-generation", 3, 10 * 60 * 1000)

    if (!rateLimit.success) {
      console.log("Rate limit exceeded for IP:", ip)
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          resetTime: rateLimit.resetTime,
        },
        { status: 429 },
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json({ success: false, error: "Invalid request format" }, { status: 400 })
    }

    const { jobDescription, candidateName, role } = body

    // Validate input
    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json({ success: false, error: "Job description is required" }, { status: 400 })
    }

    if (jobDescription.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: "Please provide a more detailed job description (at least 20 characters)" },
        { status: 400 },
      )
    }

    if (jobDescription.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Job description is too long. Please keep it under 5,000 characters" },
        { status: 400 },
      )
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      console.error("Google AI API key is not configured")
      return NextResponse.json(
        { success: false, error: "AI service is not configured. Please try again later." },
        { status: 500 },
      )
    }

    console.log("Making request to Gemini API...")

    // Create the prompt for cover letter generation
    const prompt = `You are a professional career coach and cover letter writer. Create a compelling, proactive cover letter for the following job opportunity.

INSTRUCTIONS:
- Write a professional, engaging cover letter that demonstrates enthusiasm and proactivity
- Focus on how the candidate can contribute value to the company
- Use active language and specific examples where possible
- Keep it concise but impactful (3-4 paragraphs)
- Make it sound genuine and personalized
- Include a strong opening that grabs attention
- End with a proactive call to action

${candidateName ? `CANDIDATE NAME: ${candidateName}` : "CANDIDATE NAME: [Your Name]"}
${role ? `POSITION: ${role}` : "POSITION: [Position from job description]"}

JOB DESCRIPTION:
${jobDescription}

Please write a professional cover letter that would make this candidate stand out to hiring managers.`

    // Construct the payload for the Gemini API
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generation_config: {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        max_output_tokens: 2048,
      },
    }

    // Make the API request to Gemini
    let geminiResponse
    try {
      geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      )
    } catch (fetchError) {
      console.error("Network error calling Gemini API:", fetchError)
      return NextResponse.json(
        { success: false, error: "Network error. Please check your connection and try again." },
        { status: 500 },
      )
    }

    console.log("Gemini API response status:", geminiResponse.status)

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error("Gemini API error:", geminiResponse.status, errorText)

      // Provide fallback response
      const fallbackCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${role || "position"} role at your company. After reviewing the job description, I am excited about the opportunity to contribute to your team.

Based on the requirements outlined, I believe my skills and experience align well with what you're looking for. I am particularly drawn to this role because it offers the chance to make a meaningful impact while growing professionally.

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to your team's success. Thank you for considering my application.

Best regards,
${candidateName || "[Your Name]"}`

      return NextResponse.json({
        success: true,
        coverLetter: fallbackCoverLetter,
        note: "AI service temporarily unavailable. Here's a basic cover letter template.",
      })
    }

    // Parse the Gemini response
    let geminiData
    try {
      geminiData = await geminiResponse.json()
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError)
      return NextResponse.json(
        { success: false, error: "Invalid response from AI service. Please try again." },
        { status: 500 },
      )
    }

    console.log("Gemini response structure:", JSON.stringify(geminiData, null, 2))

    // Extract the cover letter
    if (
      geminiData.candidates &&
      geminiData.candidates[0] &&
      geminiData.candidates[0].content &&
      geminiData.candidates[0].content.parts &&
      geminiData.candidates[0].content.parts[0] &&
      geminiData.candidates[0].content.parts[0].text
    ) {
      const coverLetter = geminiData.candidates[0].content.parts[0].text.trim()

      console.log("Successfully generated cover letter")
      return NextResponse.json({
        success: true,
        coverLetter: coverLetter,
      })
    } else {
      console.error("Unexpected Gemini response format:", geminiData)

      // Provide fallback response
      const fallbackCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${role || "position"} role at your company. After reviewing the job description, I am excited about the opportunity to contribute to your team.

Based on the requirements outlined, I believe my skills and experience align well with what you're looking for. I am particularly drawn to this role because it offers the chance to make a meaningful impact while growing professionally.

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to your team's success. Thank you for considering my application.

Best regards,
${candidateName || "[Your Name]"}`

      return NextResponse.json({
        success: true,
        coverLetter: fallbackCoverLetter,
        note: "AI service returned unexpected format. Here's a professional cover letter template.",
      })
    }
  } catch (error) {
    console.error("Unexpected error in cover letter generation:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
