"use client"

import { useState, useEffect } from "react"

export type SubscriptionTier = "free" | "pro" | "premium"

interface Subscription {
  id: string
  product_name: string
  price_amount: number
  price_interval: string
  current_period_end: string
  cancel_at: string | null
  status: string
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/stripe/subscription")
        const data = await response.json()

        if (data.subscription) {
          setSubscription(data.subscription)

          // Set the tier based on the subscription
          if (data.subscription.product_name.toLowerCase().includes("pro")) {
            setTier("pro")
          } else if (
            data.subscription.product_name.toLowerCase().includes("premium") ||
            data.subscription.product_name.toLowerCase().includes("enterprise")
          ) {
            setTier("premium")
          } else {
            setTier("free")
          }
        } else {
          setTier("free")
        }
      } catch (err) {
        console.error("Error fetching subscription:", err)
        setError("Failed to load subscription data")
        setTier("free") // Default to free on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  return {
    subscription,
    tier,
    isLoading,
    error,
    isPro: tier === "pro" || tier === "premium",
    isPremium: tier === "premium",
  }
}
