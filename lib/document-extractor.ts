import mammoth from "mammoth"

/**
 * Extracts text from a DOCX file using mammoth.js
 * @param buffer The file buffer
 * @returns Extracted text
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to ArrayBuffer for mammoth.js
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)

    // Use arrayBuffer option instead of buffer
    const result = await mammoth.extractRawText({ arrayBuffer })

    if (!result.value) {
      throw new Error("No text content found in the DOCX file")
    }

    return result.value
  } catch (error) {
    console.error("DOCX extraction error:", error)
    throw new Error("Failed to extract text from DOCX file")
  }
}

/**
 * Extracts text from a text file
 * @param buffer The file buffer
 * @returns Extracted text
 */
export function extractTextFromTxt(buffer: Buffer): string {
  try {
    return buffer.toString("utf-8")
  } catch (error) {
    console.error("Text file extraction error:", error)
    throw new Error("Failed to extract text from text file")
  }
}
