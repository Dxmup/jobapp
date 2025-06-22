import { type NextRequest, NextResponse } from "next/server"
import { generateSpeechWithWebSocket } from "@/lib/gemini-live-websocket"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "Kore", tone = "professional", jobContext, resumeContext } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ success: false, error: "Google AI API key not configured" }, { status: 500 })
    }

    // Create the structured interviewer prompt
    const interviewerPrompt = createInterviewerPrompt(text, jobContext, resumeContext)

    console.log(`🎙️ Generating Live API audio for interviewer prompt`)

    const audioData = await generateSpeechWithWebSocket(interviewerPrompt, process.env.GOOGLE_AI_API_KEY, voice)

    console.log(`✅ Generated audio data: ${audioData.length} characters`)

    return NextResponse.json({
      success: true,
      audioData: audioData,
      voice: voice,
      tone: tone,
      model: "gemini-2.0-flash-live-001",
    })
  } catch (error: any) {
    console.error("❌ Error generating Live API audio:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

function createInterviewerPrompt(questionText: string, jobContext?: any, resumeContext?: any): string {
  // Extract variables from context
  const applicantName = resumeContext?.name || "the candidate"
  const companyName = jobContext?.company || "our company"
  const positionTitle = jobContext?.title || "this position"
  const interviewerName = resumeContext?.interviewerName || "Alex" // Use dynamic interviewer name
  const duration = "15 minutes"
  const nextStep = "a follow-up interview with the hiring manager"
  const timeframe = "3-5 business days"

  return `ROLE: You are ${interviewerName}, a professional phone interviewer conducting a screening interview.

CONTEXT VARIABLES:
- APPLICANT_NAME: ${applicantName}
- COMPANY_NAME: ${companyName}
- POSITION_TITLE: ${positionTitle}
- INTERVIEWER_NAME: ${interviewerName}
- DURATION: ${duration}
- NEXT_STEP: ${nextStep}
- TIMEFRAME: ${timeframe}

INSTRUCTION: Generate ONLY the interviewer's spoken audio for this specific question. Do not include any candidate responses or conversation. Speak as the interviewer asking this question in a professional, warm tone.

QUESTION TO ASK: "${questionText}"

DELIVERY REQUIREMENTS:
1. Speak naturally with appropriate pauses
2. Use a warm, professional tone
3. Sound genuinely interested
4. Speak clearly for phone audio quality
5. Include natural speech patterns (slight pauses, inflection)
6. DO NOT include any stage directions, parenthetical instructions, or descriptions like "(pause)", "(short pause)", "small pause", etc.
7. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Generate only the interviewer's audio asking this specific question. Speak the words directly without any stage directions or descriptions of how to speak them.`
}
