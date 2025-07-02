import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const sig = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string)

        if (customer.deleted) {
          console.error("Customer was deleted")
          break
        }

        // Find user by email
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", customer.email)
          .single()

        if (userError || !user) {
          console.error("User not found for email:", customer.email)
          break
        }

        // Update or create subscription record
        const subscriptionData = {
          user_id: user.id,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }

        const { error: upsertError } = await supabase.from("subscriptions").upsert(subscriptionData, {
          onConflict: "stripe_subscription_id",
        })

        if (upsertError) {
          console.error("Error upserting subscription:", upsertError)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (error) {
          console.error("Error updating canceled subscription:", error)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "active",
              last_payment_date: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription as string)

          if (error) {
            console.error("Error updating subscription after payment:", error)
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "past_due",
            })
            .eq("stripe_subscription_id", invoice.subscription as string)

          if (error) {
            console.error("Error updating subscription after failed payment:", error)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
