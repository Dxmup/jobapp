import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe not configured: STRIPE_SECRET_KEY missing")
      return NextResponse.json({ error: "Payment processing is currently unavailable" }, { status: 503 })
    }

    const { subscriptionId } = await request.json()

    // Get the current user
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the subscription belongs to this user
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .eq("user_id", session.user.id)
      .single()

    if (!subscriptionData) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionData.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Update our database
    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        cancel_at: new Date(subscription.cancel_at * 1000).toISOString(),
      })
      .eq("id", subscriptionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
