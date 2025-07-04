import { cookies } from "next/headers"

export async function getCurrentUserId(): Promise<string | null> {
  try {
    // For landing page deployment, return null since we don't have auth
    return null
  } catch (error) {
    console.error("Error getting current user ID:", error)
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete("auth-token")
}

export async function getAuthCookie(): Promise<string | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")
    return token?.value || null
  } catch (error) {
    console.error("Error getting auth cookie:", error)
    return null
  }
}
