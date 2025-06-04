import { cookies } from "next/headers"
import type { User } from "@/types/auth"
import { getUserById } from "@/lib/auth-service"
import { createServerSupabaseClient } from "./supabase/server"

export async function getUserIdentity(): Promise<User | null> {
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value
  const isAuthenticated = cookieStore.get("authenticated")?.value === "true"

  console.log("getUserIdentity checking cookies:", {
    userId,
    isAuthenticated,
  })

  if (!userId || !isAuthenticated) {
    console.log("No authenticated user found in cookies")
    return null
  }

  try {
    // First try to get user from database
    const user = await getUserById(userId)

    if (user) {
      console.log("User found in database:", user.id)
      return user
    }

    // If not found in database, try to get from Supabase auth
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error || !data) {
      console.error("Error fetching user from Supabase:", error)
      return null
    }

    console.log("User found in Supabase:", data.id)
    return data
  } catch (error) {
    console.error("Error in getUserIdentity:", error)
    return null
  }
}

export async function getAllUserIds(): Promise<string[]> {
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value
  const isAuthenticated = cookieStore.get("authenticated")?.value === "true"

  if (!userId || !isAuthenticated) {
    console.log("No authenticated user found in cookies for getAllUserIds")
    return []
  }

  return [userId]
}
