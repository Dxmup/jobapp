import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getAdminUser() {
  try {
    const supabase = createClient()

    // Get the session from cookies
    const cookieStore = cookies()
    const authCookie = cookieStore.get("sb-access-token") || cookieStore.get("supabase-auth-token")

    if (!authCookie) {
      console.log("No auth cookie found")
      return null
    }

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("User error:", userError)
      return null
    }

    // For now, we'll check if the user email matches the admin email
    // In production, you should have a proper role-based system
    const adminEmail = process.env.ADMIN_EMAIL

    if (adminEmail && user.email === adminEmail) {
      return user
    }

    // Alternative: Check if user has admin role in database
    try {
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single()

      if (userRole) {
        return user
      }
    } catch (roleError) {
      console.log("Role check failed (table might not exist):", roleError)
    }

    return null
  } catch (error) {
    console.error("Admin auth error:", error)
    return null
  }
}
