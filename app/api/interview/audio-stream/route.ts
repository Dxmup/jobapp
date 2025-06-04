import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get the audio data from the request
    const formData = await request.formData()
    const audioBlob = formData.get("audio") as Blob

    if (!audioBlob) {
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 })
    }

    // Get the session ID from the request
    const sessionId = formData.get("sessionId") as string
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 })
    }

    // Convert the blob to an ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer()

    // Convert ArrayBuffer to base64
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64Audio = Buffer.from(uint8Array).toString("base64")

    // Get the user session
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Send the audio data to the Live API session
    // This would typically be handled by a service that manages the Live API session
    // For now, we'll just return a success response

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing audio stream:", error)
    return NextResponse.json(
      { error: "Failed to process audio stream", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
