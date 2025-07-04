import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminUser } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Recent users API called")

    const adminUser = await getAdminUser()
    if (!adminUser) {
      console.log("Admin authentication failed")
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    console.log("Admin user authenticated:", adminUser.email)

    const supabase = createClient()

    // Get recent users (last 10) with error handling
    let users = []

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, created_at, last_login")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching recent users:", error)
        return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 })
      }

      users = data || []
      console.log("Fetched users:", users.length)
    } catch (error) {
      console.error("Database error fetching recent users:", error)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error in recent users API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch recent users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
