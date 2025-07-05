import { type NextRequest, NextResponse } from "next/server"
import { PromptsDatabase } from "@/lib/database/prompts"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const prompt = await PromptsDatabase.getPromptById(params.id)
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }
    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Error fetching prompt:", error)
    return NextResponse.json({ error: "Failed to fetch prompt" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const prompt = await PromptsDatabase.updatePrompt(params.id, body)
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }
    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Error updating prompt:", error)
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await PromptsDatabase.deletePrompt(params.id)
    if (!success) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prompt:", error)
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 })
  }
}
