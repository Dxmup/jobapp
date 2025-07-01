import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Fallback prompts (current hardcoded prompts)
const FALLBACK_PROMPTS = {
  "interview-introduction": `ROLE: You are {interviewerName}, a professional phone interviewer from {companyName}.
{phoneScreenerInstructions}
INSTRUCTION: Deliver this introduction naturally and warmly as if starting a phone interview. Speak clearly and professionally.

INTRODUCTION: "{introText}"

DELIVERY REQUIREMENTS:
1. Speak this introduction with a warm, welcoming tone
2. Include natural pauses and inflection
3. Sound genuinely pleased to be speaking with {userFirstName}
4. DO NOT include any stage directions, parenthetical instructions, or descriptions like "(pause)", "(short pause)", "small pause", etc.
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Speak the introduction directly without any stage directions or descriptions of how to speak it.`,

  "interview-question": `ROLE: You are {interviewerName}, a professional phone interviewer conducting a {interviewType} for {jobTitle} at {companyName}.
{phoneScreenerInstructions}
INSTRUCTION: Ask this interview question naturally and professionally. Speak as if you're genuinely interested in hearing {userFirstName}'s response.

QUESTION: "{questionText}"

DELIVERY REQUIREMENTS:
1. Ask this question with a professional, encouraging tone
2. Include natural pauses and speak clearly for phone audio quality
3. Sound engaged and interested in {userFirstName}'s response
4. DO NOT include any stage directions, parenthetical instructions, or descriptions like "(pause)", "(short pause)", "small pause", etc.
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Ask the question directly without any stage directions or descriptions.`,

  "interview-closing": `ROLE: You are {interviewerName}, a professional phone interviewer concluding a screening interview.

INSTRUCTION: Deliver this closing statement naturally and professionally as if ending a phone interview.

CLOSING: "{closingText}"

DELIVERY REQUIREMENTS:
1. Speak with a warm, professional tone
2. Sound genuinely appreciative of {userFirstName}'s time
3. Speak clearly for phone audio quality
4. DO NOT include any stage directions, parenthetical instructions, or descriptions like "(pause)", "(short pause)", "small pause", etc.
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Speak the closing statement directly without any stage directions or descriptions.`,
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const category = searchParams.get("category")

    const supabase = createServerSupabaseClient()

    let query = supabase.from("prompts").select("*").eq("is_active", true)

    if (name) {
      query = query.eq("name", name)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data: prompts, error } = await query

    if (error) {
      console.error("Error fetching prompts:", error)
      return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
    }

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error("Error in prompts GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
