import { type NextRequest, NextResponse } from "next/server"
import { scanPdfForMaliciousContent, extractTextFromPdf } from "@/app/actions/pdf-actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    if (!file.type || file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Convert file to buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer())

    // Scan for malicious content
    const isSafe = await scanPdfForMaliciousContent(buffer)

    if (!isSafe) {
      return NextResponse.json(
        {
          safe: false,
          message: "The PDF contains potentially malicious content",
        },
        { status: 200 },
      )
    }

    // Extract text from PDF
    const text = await extractTextFromPdf(buffer)

    // In a real app, you would store the PDF in a storage service
    // const { url } = await uploadToStorage(buffer, file.name)

    return NextResponse.json({
      safe: true,
      text,
      // url: url,
      message: "PDF processed successfully",
    })
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 })
  }
}
