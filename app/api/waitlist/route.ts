import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getClientIP, checkEnhancedRateLimit, validateEmail, sanitizeInput } from "@/lib/security-utils"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request)

    // Moderate rate limiting for waitlist signup - 5 requests per 5 minutes
    const rateLimit = checkEnhancedRateLimit(clientIP, "waitlist-signup", "lenient")

    if (!rateLimit.success) {
      console.log("Rate limit exceeded for waitlist signup:", clientIP)
      return NextResponse.json(
        {
          error: "Too many signup attempts. Please try again later.",
          resetTime: rateLimit.resetTime,
        },
        { status: 429 },
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    // Sanitize and validate email
    const email = sanitizeInput(body.email, 254)

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Insert into waitlist table
    const { data, error } = await supabase
      .from("waitlist")
      .insert([
        {
          email: email.toLowerCase().trim(),
          source: "signup_page",
          ip_address: clientIP,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      // Handle duplicate email
      if (error.code === "23505") {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      }

      console.error("Waitlist insertion error:", error)
      throw error
    }

    console.log("New waitlist signup:", email)
    return NextResponse.json({ message: "Successfully added to waitlist", data }, { status: 201 })
  } catch (error) {
    console.error("Waitlist signup error:", error)
    return NextResponse.json({ error: "Failed to add to waitlist" }, { status: 500 })
  }
}
