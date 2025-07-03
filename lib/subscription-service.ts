import { createServerSupabaseClient } from "./supabase/server"

export type SubscriptionTier = "free" | "pro" | "premium"
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "incomplete" | "trialing"

export interface UserSubscription {
  tier: SubscriptionTier
  status: SubscriptionStatus
  expiresAt?: Date
  stripeCustomerId?: string
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const supabase = createServerSupabaseClient()

  const { data: user, error } = await supabase
    .from("users")
    .select("subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id")
    .eq("id", userId)
    .single()

  if (error || !user) {
    return { tier: "free", status: "active" }
  }

  return {
    tier: (user.subscription_tier as SubscriptionTier) || "free",
    status: (user.subscription_status as SubscriptionStatus) || "active",
    expiresAt: user.subscription_expires_at ? new Date(user.subscription_expires_at) : undefined,
    stripeCustomerId: user.stripe_customer_id || undefined,
  }
}

export async function updateUserSubscription(userId: string, subscription: Partial<UserSubscription>): Promise<void> {
  const supabase = createServerSupabaseClient()

  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (subscription.tier) updateData.subscription_tier = subscription.tier
  if (subscription.status) updateData.subscription_status = subscription.status
  if (subscription.expiresAt) updateData.subscription_expires_at = subscription.expiresAt.toISOString()
  if (subscription.stripeCustomerId) updateData.stripe_customer_id = subscription.stripeCustomerId

  const { error } = await supabase.from("users").update(updateData).eq("id", userId)

  if (error) {
    console.error("Error updating user subscription:", error)
    throw new Error("Failed to update user subscription")
  }
}

export function getSubscriptionTierFromProduct(productName: string): SubscriptionTier {
  const name = productName.toLowerCase()

  if (name.includes("pro")) return "pro"
  if (name.includes("premium") || name.includes("enterprise")) return "premium"
  return "free"
}

export function hasFeatureAccess(tier: SubscriptionTier, feature: string): boolean {
  const featureAccess = {
    free: ["basic_resume_optimization", "basic_cover_letters", "job_tracking"],
    pro: [
      "basic_resume_optimization",
      "basic_cover_letters",
      "job_tracking",
      "advanced_resume_optimization",
      "premium_cover_letters",
      "application_analytics",
      "interview_prep",
      "unlimited_applications",
    ],
    premium: [
      "basic_resume_optimization",
      "basic_cover_letters",
      "job_tracking",
      "advanced_resume_optimization",
      "premium_cover_letters",
      "application_analytics",
      "interview_prep",
      "unlimited_applications",
      "expert_resume_review",
      "custom_ai_tuning",
      "team_collaboration",
      "priority_support",
    ],
  }

  return featureAccess[tier]?.includes(feature) || false
}

export function getSubscriptionLimits(tier: SubscriptionTier) {
  const limits = {
    free: {
      jobApplications: 3,
      resumeVersions: 2,
      coverLetters: 3,
      documentRetentionDays: 7,
    },
    pro: {
      jobApplications: -1, // unlimited
      resumeVersions: -1,
      coverLetters: -1,
      documentRetentionDays: 30,
    },
    premium: {
      jobApplications: -1,
      resumeVersions: -1,
      coverLetters: -1,
      documentRetentionDays: 60,
    },
  }

  return limits[tier]
}
