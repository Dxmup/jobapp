import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google AI API key not configured" }, { status: 500 })
    }

    const { sessionId, userMessage, sessionData } = await request.json()

    if (!sessionData) {
      return NextResponse.json({ error: "Session data not found" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Create the interview context
    const systemPrompt = createInterviewSystemInstruction(sessionData)

    // Create the conversation prompt
    const prompt = `${systemPrompt}

CURRENT CONVERSATION:
User: ${userMessage}

Please respond as the interviewer. Keep your response conversational and professional, as if this is a real phone interview.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const interviewerResponse = response.text()

    return NextResponse.json({
      success: true,
      response: interviewerResponse,
      sessionId,
    })
  } catch (error) {
    console.error("Error generating interview response:", error)
    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function createInterviewSystemInstruction(sessionData: any) {
  const { jobTitle, company, jobDescription, resume, questions } = sessionData

  const technicalQuestionsText =
    questions.technical && questions.technical.length > 0
      ? questions.technical.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")
      : "No specific technical questions provided."

  const behavioralQuestionsText =
    questions.behavioral && questions.behavioral.length > 0
      ? questions.behavioral.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")
      : "No specific behavioral questions provided."

  return `You are a professional interviewer conducting a mock interview for a ${jobTitle} position at ${company}.

INTERVIEW CONTEXT:
- Job Title: ${jobTitle}
- Company: ${company}
- Job Description: ${jobDescription}
${resume ? `- Candidate's Resume: ${resume}` : ""}

AVAILABLE QUESTIONS:
Technical Questions:
${technicalQuestionsText}

Behavioral Questions:
${behavioralQuestionsText}

INTERVIEW GUIDELINES:
1. Be a friendly but professional interviewer
2. Ask follow-up questions based on the candidate's responses
3. Use the provided questions as a guide, but feel free to ask natural follow-ups
4. Provide brief, encouraging feedback
5. Keep responses concise and conversational
6. Act as if this is a real phone interview

CONVERSATION STYLE:
- Speak naturally and professionally
- Ask one question at a time
- Acknowledge the candidate's answers
- Use information from their resume when relevant
- Be encouraging but maintain professional standards`
}
