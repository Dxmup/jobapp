/**
 * This file contains functions for customizing resumes using the Google Gemini API
 */

export async function customizeResumeWithGemini(
  baselineResume: string,
  jobDescription: string,
  customInstructions?: string,
): Promise<string> {
  try {
    console.log("Starting resume customization with Google Gemini...")

    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      throw new Error("Google AI API key is not configured")
    }

    // Construct the system prompt
    const systemPrompt = `You are an expert resume writer and career coach. Your task is to customize the provided resume to match the job description. 
    Highlight relevant skills and experiences, reorder sections if needed, and tailor the content to the job requirements. 
    Keep the same general format but make it more appealing for this specific position. 
    Focus on emphasizing relevant experience and skills while maintaining truthfulness.
    Do not invent new experiences or qualifications that aren't mentioned in the original resume.
    Return ONLY the customized resume text with proper formatting, without any additional commentary or explanations.`

    // Construct the user prompt
    let userPrompt = `Job Description:\n${jobDescription}\n\nPlease customize the following resume for this job:\n\n${baselineResume}`

    // Add custom instructions if provided
    if (customInstructions && customInstructions.trim()) {
      userPrompt += `\n\nAdditional Instructions:\n${customInstructions}`
    }

    // Combine the prompts
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: combinedPrompt }],
        },
      ],
      generation_config: {
        temperature: 0.7,
        top_p: 0.95,
        top_k: 40,
        max_output_tokens: 8192,
      },
    }

    // Make the API request
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
      console.log(`Gemini customization complete. Generated ${customizedResume.length} characters.`)
      return customizedResume
    } else {
      console.error("Unexpected response format from Gemini API:", JSON.stringify(data))
      throw new Error("Failed to customize resume: Unexpected response format")
    }
  } catch (error) {
    console.error("Error customizing resume with Gemini:", error)
    throw new Error(`Failed to customize resume with Gemini: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function reviseResumeWithGemini(
  currentResume: string,
  jobDescription: string,
  customInstructions: string,
): Promise<string> {
  try {
    console.log("Starting resume revision with Google Gemini...")

    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      throw new Error("Google AI API key is not configured")
    }

    // Construct the system prompt
    const systemPrompt = `You are an expert resume writer and career coach. Your task is to revise the provided resume based on the custom instructions while keeping it tailored to the job description.
    Make specific changes as requested while maintaining a professional tone and format.
    Focus on emphasizing relevant experience and skills while maintaining truthfulness.
    Do not invent new experiences or qualifications that aren't mentioned in the original resume.
    Return ONLY the revised resume text with proper formatting, without any additional commentary or explanations.`

    // Construct the user prompt
    const userPrompt = `Job Description:\n${jobDescription}\n\nCustom Instructions:\n${customInstructions}\n\nPlease revise the following resume based on the custom instructions:\n\n${currentResume}`

    // Combine the prompts
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: combinedPrompt }],
        },
      ],
      generation_config: {
        temperature: 0.7,
        top_p: 0.95,
        top_k: 40,
        max_output_tokens: 8192,
      },
    }

    // Make the API request
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
      const revisedResume = data.candidates[0].content.parts[0].text
      console.log(`Gemini revision complete. Generated ${revisedResume.length} characters.`)
      return revisedResume
    } else {
      console.error("Unexpected response format from Gemini API:", JSON.stringify(data))
      throw new Error("Failed to revise resume: Unexpected response format")
    }
  } catch (error) {
    console.error("Error revising resume with Gemini:", error)
    throw new Error(`Failed to revise resume with Gemini: ${error instanceof Error ? error.message : String(error)}`)
  }
}
