import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserIdOptional } from "@/lib/auth-cookie"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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

    // Remove deletion marking
    const { error: userError } = await supabase
      .from("users")
      .update({
        marked_for_deletion: false,
        deletion_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (userError) {
      console.error("Error canceling account deletion:", userError)
      return NextResponse.json(
        {
          error: "Failed to cancel account deletion",
        },
        { status: 500 },
      )
    }

    // Log the cancellation (anonymized)
    const anonymizedUserId = `anon_${userId.slice(-8)}`
    await supabase.from("audit_logs").insert({
      user_id: anonymizedUserId,
      action: "account_deletion_canceled",
      resource: "user_account",
      resource_id: anonymizedUserId,
      details: {
        canceled_at: new Date().toISOString(),
      },
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Account deletion canceled successfully",
    })
  } catch (error) {
    console.error("Exception in canceling account deletion:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
