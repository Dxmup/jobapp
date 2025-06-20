import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const googleApiKey = process.env.GOOGLE_AI_API_KEY

    return NextResponse.json({
      success: true,
      hasGoogleApiKey: !!googleApiKey,
      keyLength: googleApiKey ? googleApiKey.length : 0,
      keyPrefix: googleApiKey ? googleApiKey.substring(0, 8) + "..." : "not found",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Env check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
