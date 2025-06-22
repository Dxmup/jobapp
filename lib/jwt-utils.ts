import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { getUserRoles } from "./auth-service"

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || "fallback-secret-for-development")
const JWT_EXPIRY = "8h" // 8 hours

export async function createRoleToken(userId: string): Promise<string> {
  try {
    // Get user roles from database
    const roles = await getUserRoles(userId)

    // Create JWT with user ID and roles
    const token = await new SignJWT({ userId, roles })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRY)
      .sign(JWT_SECRET)

    return token
  } catch (error) {
    console.error("Error creating role token:", error)
    throw error
  }
}

export async function verifyRoleToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string; roles: string[] }
  } catch (error) {
    console.error("Error verifying role token:", error)
    return null
  }
}

export async function setRoleToken(userId: string) {
  try {
    const token = await createRoleToken(userId)
    const cookieStore = cookies()
    cookieStore.set("role_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours in seconds
    })
    return true
  } catch (error) {
    console.error("Error setting role token:", error)
    return false
  }
}

export async function getRolesFromToken(): Promise<string[]> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("role_token")?.value

    if (!token) {
      return []
    }

    const payload = await verifyRoleToken(token)
    return payload?.roles || []
  } catch (error) {
    console.error("Error getting roles from token:", error)
    return []
  }
}

export async function hasRoleFromToken(role: string): Promise<boolean> {
  const roles = await getRolesFromToken()
  return roles.includes(role)
}
