import Stripe from "stripe"

// Check for Stripe secret key with better error handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY environment variable is not defined")
  throw new Error("Stripe configuration error: STRIPE_SECRET_KEY is required")
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16", // Use the latest API version
})

// Price IDs for our subscription tiers - with fallback handling
export const STRIPE_PRICE_IDS = {
  PRO: process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || "",
}

// Helper to format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price / 100)
}

// Helper to check if Stripe is properly configured
export function isStripeConfigured(): boolean {
  return !!(stripeSecretKey && (STRIPE_PRICE_IDS.PRO || STRIPE_PRICE_IDS.PREMIUM))
}
