import { type NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("Admin debug endpoint called")

    const adminUser = await getAdminUser()
    console.log("Admin user result:", adminUser ? { id: adminUser.id, email: adminUser.email } : null)

    if (!adminUser) {
      return NextResponse.json(
        {
          error: "Not authenticated as admin",
          adminEmail: process.env.ADMIN_EMAIL ? "Set" : "Not set",
        },
        { status: 401 },
      )
    }

    // Test database connection
    const supabase = createClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    return NextResponse.json({
      success: true,
      adminUser: { id: adminUser.id, email: adminUser.email },
      databaseTest: error ? { error: error.message } : { success: true, data },
    })
  } catch (error) {
    console.error("Admin debug error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
