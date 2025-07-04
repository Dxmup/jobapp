import { NextResponse } from "next/server"
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { priceId, returnUrl } = await request.json()

    // Validate the price ID
    if (!Object.values(STRIPE_PRICE_IDS).includes(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 })
    }

    // Get the current user
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create the customer
    const { data: customerData } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", session.user.id)
      .single()

    let customerId = customerData?.stripe_customer_id

    if (!customerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          supabase_user_id: session.user.id,
        },
      })

      customerId = customer.id

      // Save the customer ID in our database
      await supabase.from("stripe_customers").insert({
        user_id: session.user.id,
        stripe_customer_id: customerId,
      })
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?success=true`,
      cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?canceled=true`,
      subscription_data: {
        metadata: {
          supabase_user_id: session.user.id,
        },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
