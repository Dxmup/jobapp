import { type NextRequest, NextResponse } from "next/server"
import { extractTextFromPdf, scanPdfForMaliciousContent } from "@/app/actions/pdf-actions"

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Check if the file is a PDF
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ success: false, error: "File must be a PDF" }, { status: 400 })
    }

    console.log("Processing PDF file:", file.name, `(${file.size} bytes)`)

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Scan the PDF for malicious content
    try {
      const isSafe = await scanPdfForMaliciousContent(buffer)
      if (!isSafe) {
        return NextResponse.json(
          { success: false, error: "The PDF contains potentially malicious content" },
          { status: 400 },
        )
      }
    } catch (scanError) {
      console.error("Error scanning PDF:", scanError)
      // Continue even if scanning fails
    }

    // Extract text from the PDF using Gemini
    try {
      console.log("Extracting text from PDF with Gemini...")
      const text = await extractTextFromPdf(buffer)

      if (!text || text.trim().length === 0) {
        return NextResponse.json({ success: false, error: "Could not extract text from the PDF" }, { status: 422 })
      }

      // Return the extracted text
      return NextResponse.json({
        success: true,
        text,
      })
    } catch (extractError) {
      console.error("Error extracting text:", extractError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to extract text from PDF",
          details: extractError instanceof Error ? extractError.message : "Unknown extraction error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
