import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Fallback prompts for when database is not available
const FALLBACK_PROMPTS = {
  "interview-introduction": {
    name: "interview-introduction",
    category: "interview",
    content: `ROLE: You are {interviewerName}, a professional phone interviewer from {companyName}.

INSTRUCTION: Deliver this introduction naturally and warmly as if starting a phone interview. Speak clearly and professionally.

INTRODUCTION: "{introText}"

DELIVERY REQUIREMENTS:
1. Speak this introduction with a warm, welcoming tone
2. Include natural pauses and inflection
3. Sound genuinely pleased to be speaking with {userFirstName}
4. DO NOT include any stage directions, parenthetical instructions, or descriptions
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Speak the introduction directly without any stage directions or descriptions.`,
    variables: ["interviewerName", "companyName", "introText", "userFirstName"],
    is_active: true,
    fallback: true,
  },
  "interview-question": {
    name: "interview-question",
    category: "interview",
    content: `ROLE: You are {interviewerName}, a professional phone interviewer conducting a {interviewType} for {jobTitle} at {companyName}.

INSTRUCTION: Ask this interview question naturally and professionally. Speak as if you're genuinely interested in hearing {userFirstName}'s response.

QUESTION: "{questionText}"

DELIVERY REQUIREMENTS:
1. Ask this question with a professional, encouraging tone
2. Include natural pauses and speak clearly for phone audio quality
3. Sound engaged and interested in {userFirstName}'s response
4. DO NOT include any stage directions, parenthetical instructions, or descriptions
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Ask the question directly without any stage directions or descriptions.`,
    variables: ["interviewerName", "interviewType", "jobTitle", "companyName", "userFirstName", "questionText"],
    is_active: true,
    fallback: true,
  },
  "interview-closing": {
    name: "interview-closing",
    category: "interview",
    content: `ROLE: You are {interviewerName}, a professional phone interviewer concluding a screening interview.

INSTRUCTION: Deliver this closing statement naturally and professionally as if ending a phone interview.

CLOSING: "{closingText}"

DELIVERY REQUIREMENTS:
1. Speak with a warm, professional tone
2. Sound genuinely appreciative of {userFirstName}'s time
3. Speak clearly for phone audio quality
4. DO NOT include any stage directions, parenthetical instructions, or descriptions
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Speak the closing statement directly without any stage directions or descriptions.`,
    variables: ["interviewerName", "closingText", "userFirstName"],
    is_active: true,
    fallback: true,
  },
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const category = searchParams.get("category")

    if (name) {
      // Try to get specific prompt by name from database
      const { data: prompt, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("name", name)
        .eq("is_active", true)
        .single()

      if (!error && prompt) {
        return NextResponse.json({ prompt })
      }

      // Fallback to hardcoded prompt if database fails
      const fallbackPrompt = FALLBACK_PROMPTS[name as keyof typeof FALLBACK_PROMPTS]
      if (fallbackPrompt) {
        return NextResponse.json({ prompt: fallbackPrompt })
      }

      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    if (category) {
      // Try to get all prompts in category from database
      const { data: prompts, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("name")

      if (!error && prompts) {
        return NextResponse.json({ prompts })
      }

      // Fallback to hardcoded prompts
      const fallbackPrompts = Object.values(FALLBACK_PROMPTS).filter((p) => p.category === category)
      return NextResponse.json({ prompts: fallbackPrompts })
    }

    // Get all active prompts
    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (!error && prompts) {
      return NextResponse.json({ prompts })
    }

    // Fallback to all hardcoded prompts
    return NextResponse.json({ prompts: Object.values(FALLBACK_PROMPTS) })
  } catch (error) {
    console.error("API error:", error)

    // Always return fallback on error
    const name = new URL(request.url).searchParams.get("name")
    if (name && FALLBACK_PROMPTS[name as keyof typeof FALLBACK_PROMPTS]) {
      return NextResponse.json({ prompt: FALLBACK_PROMPTS[name as keyof typeof FALLBACK_PROMPTS] })
    }

    return NextResponse.json({ prompts: Object.values(FALLBACK_PROMPTS) })
  }
}
