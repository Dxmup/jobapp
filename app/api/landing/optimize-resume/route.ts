import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { rateLimit } from "@/lib/rate-limit"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

// Rate limiting: 3 requests per 10 minutes per IP
const limiter = rateLimit({
  interval: 10 * 60 * 1000, // 10 minutes
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per interval
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = request.ip ?? "anonymous"
    const { success, remaining } = await limiter.check(3, identifier)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again in a few minutes.",
        },
        { status: 429 },
      )
    }

    // Parse request body
    const body = await request.json()
    const { resumeText, jobDescription } = body

    // Validate inputs
    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume text is required and cannot be empty.",
        },
        { status: 400 },
      )
    }

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description is required and cannot be empty.",
        },
        { status: 400 },
      )
    }

    // Validate API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("GOOGLE_AI_API_KEY is not configured")
      return NextResponse.json(
        {
          success: false,
          error: "AI service is not properly configured.",
        },
        { status: 500 },
      )
    }

    // Create the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })

    // Create the prompt
    const prompt = `
You are an expert resume optimization specialist. Analyze the provided resume against the job description and provide specific, actionable improvements.

RESUME:
${resumeText.trim()}

JOB DESCRIPTION:
${jobDescription.trim()}

Please provide:
1. A list of specific improvements to make the resume more relevant to this job
2. Keywords that should be added or emphasized
3. Skills or experiences that should be highlighted more prominently
4. Any sections that could be restructured or improved

Format your response as a JSON object with the following structure:
{
  "improvements": ["improvement 1", "improvement 2", ...],
  "keywords": ["keyword 1", "keyword 2", ...],
  "highlights": ["highlight 1", "highlight 2", ...],
  "restructuring": ["suggestion 1", "suggestion 2", ...]
}

Keep suggestions specific, actionable, and focused on making the resume more competitive for this particular role.
`

    console.log("Making request to Gemini AI...")

    // Generate content with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const result = await model.generateContent(prompt)
      clearTimeout(timeoutId)

      if (!result.response) {
        throw new Error("No response received from AI model")
      }

      const responseText = result.response.text()
      console.log("Raw AI response:", responseText)

      if (!responseText || responseText.trim().length === 0) {
        throw new Error("Empty response from AI model")
      }

      // Try to parse JSON response
      let optimizationData
      try {
        // Clean the response text to extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error("No JSON found in response")
        }

        optimizationData = JSON.parse(jsonMatch[0])
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError)

        // Fallback: create structured response from text
        optimizationData = {
          improvements: [
            "Tailor your professional summary to match the job requirements",
            "Add relevant keywords from the job description throughout your resume",
            "Quantify your achievements with specific numbers and metrics",
            "Highlight skills that directly match the job requirements",
            "Reorganize sections to prioritize most relevant experience",
          ],
          keywords: ["leadership", "project management", "team collaboration", "problem solving"],
          highlights: [
            "Emphasize achievements that demonstrate impact and results",
            "Showcase technical skills relevant to the position",
            "Highlight any certifications or training mentioned in the job posting",
          ],
          restructuring: [
            "Move most relevant experience to the top of your work history",
            "Create a skills section that mirrors job requirements",
            "Add a projects section if relevant to the role",
          ],
        }
      }

      // Validate the structure
      if (!optimizationData.improvements || !Array.isArray(optimizationData.improvements)) {
        optimizationData.improvements = ["Review and tailor your resume content to better match the job requirements"]
      }
      if (!optimizationData.keywords || !Array.isArray(optimizationData.keywords)) {
        optimizationData.keywords = ["relevant", "experience", "skills"]
      }
      if (!optimizationData.highlights || !Array.isArray(optimizationData.highlights)) {
        optimizationData.highlights = ["Highlight your most relevant achievements"]
      }
      if (!optimizationData.restructuring || !Array.isArray(optimizationData.restructuring)) {
        optimizationData.restructuring = ["Consider reorganizing sections for better impact"]
      }

      return NextResponse.json({
        success: true,
        optimization: optimizationData,
        remaining: remaining,
      })
    } catch (aiError) {
      clearTimeout(timeoutId)

      if (aiError instanceof Error && aiError.name === "AbortError") {
        console.error("AI request timed out")
        return NextResponse.json(
          {
            success: false,
            error: "Request timed out. Please try again with a shorter resume or job description.",
          },
          { status: 408 },
        )
      }

      throw aiError
    }
  } catch (error) {
    console.error("Resume optimization error:", error)

    // Provide fallback optimization suggestions
    const fallbackOptimization = {
      improvements: [
        "Tailor your professional summary to match the specific job requirements",
        "Include relevant keywords from the job description throughout your resume",
        "Quantify your achievements with specific numbers, percentages, or metrics",
        "Highlight technical skills and tools mentioned in the job posting",
        "Reorganize your experience to prioritize the most relevant roles",
      ],
      keywords: ["leadership", "teamwork", "problem-solving", "communication", "results-driven"],
      highlights: [
        "Emphasize achievements that demonstrate measurable impact",
        "Showcase any certifications or training relevant to the role",
        "Highlight projects or experiences that align with job responsibilities",
      ],
      restructuring: [
        "Move your most relevant work experience to the top",
        "Create a dedicated skills section that mirrors job requirements",
        "Consider adding a projects or achievements section if applicable",
      ],
    }

    return NextResponse.json({
      success: true,
      optimization: fallbackOptimization,
      note: "Using general optimization suggestions due to service limitations.",
    })
  }
}
