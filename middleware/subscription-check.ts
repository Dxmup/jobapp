import { type NextRequest, NextResponse } from "next/server"
import { getUserSubscription, hasFeatureAccess } from "@/lib/subscription-service"
import { getCurrentUser } from "@/lib/auth-service"

export async function checkSubscriptionAccess(
  request: NextRequest,
  requiredFeature: string,
): Promise<NextResponse | null> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await getUserSubscription(user.id)

    if (!hasFeatureAccess(subscription.tier, requiredFeature)) {
      return NextResponse.json(
        {
          error: "Subscription upgrade required",
          requiredFeature,
          currentTier: subscription.tier,
        },
        { status: 403 },
      )
    }

    return null // Access granted
  } catch (error) {
    console.error("Error checking subscription access:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
