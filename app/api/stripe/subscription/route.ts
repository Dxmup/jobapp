import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Get the current user
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
