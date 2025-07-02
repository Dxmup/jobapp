import { NextResponse } from "next/server"
import { PromptsDatabase } from "@/lib/database/prompts"

export async function GET() {
  try {
    const types = await PromptsDatabase.getPromptTypes()
    return NextResponse.json(types)
  } catch (error) {
    console.error("Error fetching prompt types:", error)
    return NextResponse.json({ error: "Failed to fetch prompt types" }, { status: 500 })
  }
}
