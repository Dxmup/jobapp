import { NextResponse } from "next/server"
import { getUserSubscription } from "@/lib/subscription-service"
import { getCurrentUser } from "@/lib/auth-service"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await getUserSubscription(user.id)

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Error fetching user subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
