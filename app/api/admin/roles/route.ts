import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { isUserAdmin } from "@/lib/auth-service"

export async function GET() {
  try {
    // Check if user is admin
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(userId)

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 })
    }

    // Fetch all roles
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("roles").select("*").order("id")

    if (error) {
      console.error("Error fetching roles:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, roles: data })
  } catch (error) {
    console.error("Exception in roles API:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
