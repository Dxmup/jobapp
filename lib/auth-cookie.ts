import { cookies } from "next/headers"

export async function getCurrentUserIdOptional(): Promise<string | null> {
  try {
    const cookieStore = cookies()
    const userCookie = cookieStore.get("user_id")
    return userCookie?.value || null
  } catch (error) {
    return null
  }
}

export async function getCurrentUserId(): Promise<string> {
  const userId = await getCurrentUserIdOptional()
  if (!userId) {
    throw new Error("User not authenticated")
  }
  return userId
}

export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserIdOptional()
  return userId !== null
}
