import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId)
        if (!customer || customer.deleted) {
          throw new Error("Customer not found")
        }

        const email = (customer as Stripe.Customer).email
        if (!email) {
          throw new Error("Customer email not found")
        }

        // Update user subscription in database
        const { error } = await supabase
          .from("user_profiles")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_plan: subscription.items.data[0]?.price.id,
            subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("email", email)

        if (error) {
          console.error("Error updating subscription:", error)
          throw error
        }

        console.log(`Subscription ${subscription.status} for customer ${customerId}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId)
        if (!customer || customer.deleted) {
          throw new Error("Customer not found")
        }

        const email = (customer as Stripe.Customer).email
        if (!email) {
          throw new Error("Customer email not found")
        }

        // Update user subscription status to cancelled
        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("email", email)

        if (error) {
          console.error("Error cancelling subscription:", error)
          throw error
        }

        console.log(`Subscription cancelled for customer ${customerId}`)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId)
        if (!customer || customer.deleted) {
          throw new Error("Customer not found")
        }

        const email = (customer as Stripe.Customer).email
        if (!email) {
          throw new Error("Customer email not found")
        }

        // Update payment status
        const { error } = await supabase
          .from("user_profiles")
          .update({
            last_payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("email", email)

        if (error) {
          console.error("Error updating payment status:", error)
          throw error
        }

        console.log(`Payment succeeded for customer ${customerId}`)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId)
        if (!customer || customer.deleted) {
          throw new Error("Customer not found")
        }

        const email = (customer as Stripe.Customer).email
        if (!email) {
          throw new Error("Customer email not found")
        }

        // Handle failed payment - could send notification, update status, etc.
        console.log(`Payment failed for customer ${customerId}`)
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
