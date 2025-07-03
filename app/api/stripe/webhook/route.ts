import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { updateUserSubscription, getSubscriptionTierFromProduct } from "@/lib/subscription-service"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get("stripe-signature") as string

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook secret is not set" }, { status: 500 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`)
    return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Handle the event
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as any
      const userId = subscription.metadata.supabase_user_id

      if (!userId) {
        console.error("No user ID found in subscription metadata")
        break
      }

      // Get the price details
      const price = await stripe.prices.retrieve(subscription.items.data[0].price.id)
      const productId = price.product as string
      const product = await stripe.products.retrieve(productId)

      // Determine subscription tier from product name
      const tier = getSubscriptionTierFromProduct(product.name)

      // Update or insert the subscription in our database
      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          stripe_price_id: subscription.items.data[0].price.id,
          stripe_product_id: productId,
          product_name: product.name,
          price_amount: price.unit_amount,
          price_interval: price.recurring?.interval,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        },
        {
          onConflict: "stripe_subscription_id",
        },
      )

      if (error) {
        console.error("Error updating subscription:", error)
      }

      // Update the user's subscription status and tier
      await updateUserSubscription(userId, {
        tier,
        status: subscription.status === "active" ? "active" : subscription.status,
        expiresAt: new Date(subscription.current_period_end * 1000),
        stripeCustomerId: subscription.customer,
      })

      break
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any
      const userId = subscription.metadata.supabase_user_id

      // Update the subscription status in our database
      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id)

      // Reset the user's subscription to free tier
      if (userId) {
        await updateUserSubscription(userId, {
          tier: "free",
          status: "active",
          expiresAt: undefined,
        })
      }

      break
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as any
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
      const userId = subscription.metadata.supabase_user_id

      if (userId) {
        await updateUserSubscription(userId, {
          status: "past_due",
        })
      }

      break
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
      const userId = subscription.metadata.supabase_user_id

      if (userId) {
        await updateUserSubscription(userId, {
          status: "active",
          expiresAt: new Date(subscription.current_period_end * 1000),
        })
      }

      break
    }
  }

  return NextResponse.json({ received: true })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
