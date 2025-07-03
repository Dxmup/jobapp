"use client"

import { useState, useEffect } from "react"
import { type UserSubscription, hasFeatureAccess, getSubscriptionLimits } from "@/lib/subscription-service"

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/user/subscription")
        const data = await response.json()

        if (data.subscription) {
          setSubscription(data.subscription)
        } else {
          setSubscription({ tier: "free", status: "active" })
        }
      } catch (err) {
        console.error("Error fetching subscription:", err)
        setError("Failed to load subscription data")
        setSubscription({ tier: "free", status: "active" }) // Default to free on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  return {
    subscription,
    isLoading,
    error,
    tier: subscription?.tier || "free",
    status: subscription?.status || "active",
    isPro: subscription?.tier === "pro" || subscription?.tier === "premium",
    isPremium: subscription?.tier === "premium",
    hasFeature: (feature: string) => hasFeatureAccess(subscription?.tier || "free", feature),
    limits: getSubscriptionLimits(subscription?.tier || "free"),
  }
}
