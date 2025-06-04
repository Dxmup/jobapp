import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16", // Use the latest API version
})

// Price IDs for our subscription tiers
export const STRIPE_PRICE_IDS = {
  PRO: process.env.STRIPE_PRO_PRICE_ID || "",
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID || "",
}

// Helper to format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price / 100)
}
