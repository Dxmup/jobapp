import { extractTextFromPdfWithGemini } from "@/lib/gemini-pdf-extractor"

// Function to extract text from a PDF file
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // Use Gemini to extract text from the PDF
    const extractedText = await extractTextFromPdfWithGemini(pdfBuffer)
    return extractedText
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw error
  }
}

// Function to scan a PDF for malicious content
export async function scanPdfForMaliciousContent(pdfBuffer: Buffer): Promise<boolean> {
  // In a real application, you would implement a proper security scan
  // For now, we'll just do a basic check for suspicious patterns

  try {
    // Convert buffer to string for basic scanning
    const pdfString = pdfBuffer.toString("utf-8", 0, Math.min(5000, pdfBuffer.length))

    // Check for suspicious patterns (very basic example)
    const suspiciousPatterns = [/<script>/i, /eval\(/i, /javascript:/i, /execCommand/i]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(pdfString)) {
        console.warn("Potentially malicious content detected in PDF")
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error scanning PDF:", error)
    // If there's an error scanning, assume it's safe to continue
    return true
  }
}
