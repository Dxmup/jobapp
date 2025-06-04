import { type NextRequest, NextResponse } from "next/server"
import { extractTextFromDocx, extractTextFromTxt } from "@/lib/document-extractor"
import { extractTextFromPdfWithGemini } from "@/lib/gemini-pdf-extractor"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Check file size (limit to 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File too large",
          details: "Maximum file size is 10MB",
        },
        { status: 400 },
      )
    }

    const fileName = file.name.toLowerCase()

    // Log file details for debugging
    console.log("Processing file:", {
      name: fileName,
      type: file.type,
      size: `${Math.round(file.size / 1024)} KB`,
    })

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log("Buffer created with size:", buffer.length)

    let text = ""

    // Route based on file type
    if (fileName.endsWith(".pdf")) {
      // Use Gemini for PDF extraction
      try {
        console.log("Starting PDF extraction with Gemini...")
        text = await extractTextFromPdfWithGemini(buffer)
        console.log("PDF extraction completed, text length:", text.length)
      } catch (error) {
        console.error("PDF extraction error:", error)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to extract text from PDF",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } else if (fileName.endsWith(".docx")) {
      // Use mammoth.js for DOCX extraction
      try {
        console.log("Starting DOCX extraction with mammoth.js...")
        text = await extractTextFromDocx(buffer)
        console.log("DOCX extraction completed, text length:", text.length)
      } catch (error) {
        console.error("DOCX extraction error:", error)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to extract text from DOCX",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } else if (fileName.endsWith(".txt")) {
      // Direct text extraction
      try {
        console.log("Starting TXT extraction...")
        text = extractTextFromTxt(buffer)
        console.log("TXT extraction completed, text length:", text.length)
      } catch (error) {
        console.error("Text file extraction error:", error)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to extract text from text file",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } else if (fileName.endsWith(".doc")) {
      // Provide helpful message for DOC files
      return NextResponse.json(
        {
          success: false,
          error: "DOC format not supported",
          details: "Please convert your file to DOCX or PDF format for better compatibility.",
        },
        { status: 400 },
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type",
          details: "Please upload a PDF, DOCX, or TXT file",
        },
        { status: 400 },
      )
    }

    // Validate extracted text
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No text could be extracted",
          details: "The document appears to be empty or contains no extractable text",
        },
        { status: 422 },
      )
    }

    return NextResponse.json({
      success: true,
      text,
      fileType: fileName.split(".").pop(),
    })
  } catch (error) {
    console.error("Document extraction error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
