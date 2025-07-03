import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"

export async function GET() {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Check if user already has a calendar token
    const { data: existingToken, error: tokenError } = await supabase
      .from("user_calendar_tokens")
      .select("token")
      .eq("user_id", userId)
      .single()

    let calendarToken: string

    if (tokenError || !existingToken) {
      // Create a new token
      calendarToken = nanoid(32)

      // Store the token in the database
      await supabase.from("user_calendar_tokens").insert({
        user_id: userId,
        token: calendarToken,
        created_at: new Date().toISOString(),
      })
    } else {
      calendarToken = existingToken.token
    }

    // Generate the iCal URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const icalUrl = `${siteUrl}/api/calendar/feed/${calendarToken}`

    return NextResponse.json({ url: icalUrl })
  } catch (error) {
    console.error("Error generating iCal link:", error)
    return NextResponse.json({ error: "Failed to generate iCal link" }, { status: 500 })
  }
}
