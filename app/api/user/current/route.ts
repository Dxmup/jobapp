import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import { getCurrentUserIdOptional } from "@/lib/auth-cookie"

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserIdOptional()

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Return safe user data (no sensitive info)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("Error fetching current user:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
