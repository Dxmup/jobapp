import { NextResponse } from "next/server"

export async function GET() {
  try {
    const googleApiKey = process.env.GOOGLE_AI_API_KEY

    return NextResponse.json({
      success: true,
      hasGoogleApiKey: !!googleApiKey,
      keyLength: googleApiKey ? googleApiKey.length : 0,
      keyPrefix: googleApiKey ? googleApiKey.substring(0, 8) + "..." : "not found",
      allEnvKeys: Object.keys(process.env).filter(
        (key) => key.includes("GOOGLE") || key.includes("API") || key.includes("KEY"),
      ),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
