import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "You must be logged in to customize a resume" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const { resumeContent, jobDescription, customInstructions } = body

    if (!resumeContent || !jobDescription) {
      return NextResponse.json({ error: "Resume content and job description are required" }, { status: 400 })
    }

    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      throw new Error("Google AI API key is not configured")
    }

    // Create the prompt for the AI
    const prompt = `
You are a professional resume writer with expertise in tailoring resumes for specific job descriptions.

RESUME CONTENT:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

${customInstructions ? `ADDITIONAL INSTRUCTIONS: ${customInstructions}` : ""}

Please customize the resume to highlight the most relevant skills, experiences, and qualifications for this specific job. 
Make sure to:
1. Match keywords from the job description
2. Emphasize relevant achievements and skills
3. Adjust the professional summary to target this role
4. Maintain the original resume format and structure
5. Keep the same sections and overall organization
6. Do not add fictional experiences or skills not mentioned in the original resume

Return only the customized resume content, maintaining the original formatting.
`

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
        top_p: 0.95,
        top_k: 40,
        max_output_tokens: 8192,
      },
    }

    // Make the API request directly to the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    )

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gemini API error:", errorData)
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    // Parse the response
    const data = await response.json()

    // Extract the text from the response
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text
    ) {
      const customizedResume = data.candidates[0].content.parts[0].text
      return NextResponse.json({ customizedResume })
    } else {
      console.error("Unexpected response format from Gemini API:", JSON.stringify(data))
      throw new Error("Failed to customize resume: Unexpected response format")
    }
  } catch (error) {
    console.error("Error customizing resume:", error)
    return NextResponse.json({ error: "Failed to customize resume" }, { status: 500 })
  }
}
