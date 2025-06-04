export async function extractTextFromPdfWithGemini(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("Starting PDF extraction with Google Gemini...")

    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      throw new Error("Google AI API key is not configured")
    }

    // Convert the buffer to base64 for sending to Gemini
    const base64Pdf = pdfBuffer.toString("base64")

    // Construct the request payload
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Extract all the text content from this resume PDF. Return ONLY the extracted text, formatted cleanly with proper spacing and line breaks. Do not include any analysis, commentary, or additional text.",
            },
            {
              inline_data: {
                mime_type: "application/pdf",
                data: base64Pdf,
              },
            },
          ],
        },
      ],
      generation_config: {
        temperature: 0.0,
        top_p: 0.95,
        top_k: 0,
        max_output_tokens: 8192,
      },
    }

    // Make the API request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
      const extractedText = data.candidates[0].content.parts[0].text
      console.log(`Gemini extraction complete. Extracted ${extractedText.length} characters.`)
      return extractedText
    } else {
      console.error("Unexpected response format from Gemini API:", JSON.stringify(data))
      throw new Error("Failed to extract text: Unexpected response format")
    }
  } catch (error) {
    console.error("Error extracting text with Gemini:", error)
    throw new Error(`Failed to extract text with Gemini: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Add a wrapper function with the expected name
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return extractTextFromPdfWithGemini(buffer)
}
