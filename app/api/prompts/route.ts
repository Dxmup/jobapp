import { type NextRequest, NextResponse } from "next/server"
import { PromptsDatabase } from "@/lib/database/prompts"

// GET - Fetch prompts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const active = searchParams.get("active")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const filters = {
      type: type || undefined,
      active: active === "true" ? true : active === "false" ? false : undefined,
      search: search || undefined,
    }

    const result = await PromptsDatabase.getPrompts(filters, page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching prompts:", error)
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
  }
}

// POST - Create a new prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prompt = await PromptsDatabase.createPrompt(body)
    return NextResponse.json(prompt, { status: 201 })
  } catch (error) {
    console.error("Error creating prompt:", error)
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
  }
}
