import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    // Get the current user
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the customer ID
    const { data: customerData } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", session.user.id)
      .single()

    if (!customerData?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 })
    }

    // Create a portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
