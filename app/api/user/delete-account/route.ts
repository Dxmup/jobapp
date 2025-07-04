import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserIdOptional } from "@/lib/auth-cookie"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserIdOptional()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        { status: 401 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Mark account for deletion with 30-day grace period
    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() + 30)

    // Update user record to mark for deletion
    const { error: userError } = await supabase
      .from("users")
      .update({
        marked_for_deletion: true,
        deletion_date: deletionDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (userError) {
      console.error("Error marking user for deletion:", userError)
      return NextResponse.json(
        {
          error: "Failed to schedule account deletion",
        },
        { status: 500 },
      )
    }

    // Log the deletion request (anonymized)
    const anonymizedUserId = `anon_${userId.slice(-8)}`
    await supabase.from("audit_logs").insert({
      user_id: anonymizedUserId,
      action: "account_deletion_requested",
      resource: "user_account",
      resource_id: anonymizedUserId,
      details: {
        scheduled_deletion_date: deletionDate.toISOString(),
        grace_period_days: 30,
      },
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      created_at: new Date().toISOString(),
    })

    // Clear authentication cookies
    const cookieStore = cookies()
    cookieStore.delete("user_id")
    cookieStore.delete("session_token")
    cookieStore.delete("has_baseline_resume")

    return NextResponse.json({
      success: true,
      message: "Account scheduled for deletion",
      deletion_date: deletionDate.toISOString(),
      grace_period_days: 30,
    })
  } catch (error) {
    console.error("Exception in account deletion:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
