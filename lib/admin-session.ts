import { cookies } from "next/headers"
import { createServerSupabaseClient } from "./supabase/server"
import { v4 as uuidv4 } from "uuid"

const SESSION_COOKIE_NAME = "admin_session"
const SESSION_DURATION_HOURS = 4 // 4 hours

export async function createAdminSession(userId: string, ipAddress?: string, userAgent?: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Generate a unique session token
    const token = uuidv4()

    // Calculate expiration time (4 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS)

    // Create session record in database
    const { data, error } = await supabase
      .from("admin_sessions")
      .insert({
        user_id: userId,
        token,
        ip_address: ipAddress || "unknown",
        user_agent: userAgent || "unknown",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating admin session:", error)
      return { success: false, error: error.message }
    }

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    })

    return { success: true, sessionId: data.id }
  } catch (error) {
    console.error("Exception in createAdminSession:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function validateAdminSession() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return { valid: false, reason: "No session token found" }
    }

    const supabase = createServerSupabaseClient()

    // Get session from database
    const { data, error } = await supabase
      .from("admin_sessions")
      .select("*, users(id, email, name)")
      .eq("token", sessionToken)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return { valid: false, reason: "Invalid session token" }
    }

    // Check if session has expired
    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    if (now > expiresAt) {
      // Deactivate expired session
      await supabase.from("admin_sessions").update({ is_active: false }).eq("id", data.id)

      return { valid: false, reason: "Session expired" }
    }

    // Update last active timestamp
    await supabase.from("admin_sessions").update({ last_active_at: new Date().toISOString() }).eq("id", data.id)

    return {
      valid: true,
      userId: data.user_id,
      user: data.users,
      sessionId: data.id,
    }
  } catch (error) {
    console.error("Exception in validateAdminSession:", error)
    return { valid: false, reason: "Error validating session" }
  }
}

export async function endAdminSession() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionToken) {
      const supabase = createServerSupabaseClient()

      // Deactivate session in database
      await supabase.from("admin_sessions").update({ is_active: false }).eq("token", sessionToken)

      // Remove session cookie
      cookieStore.delete(SESSION_COOKIE_NAME)
    }

    return { success: true }
  } catch (error) {
    console.error("Exception in endAdminSession:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getActiveAdminSessions(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("admin_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching active admin sessions:", error)
      return { success: false, error: error.message, sessions: [] }
    }

    return { success: true, sessions: data }
  } catch (error) {
    console.error("Exception in getActiveAdminSessions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      sessions: [],
    }
  }
}

export async function terminateAdminSession(sessionId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("admin_sessions").update({ is_active: false }).eq("id", sessionId)

    if (error) {
      console.error("Error terminating admin session:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Exception in terminateAdminSession:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function terminateAllAdminSessions(userId: string, exceptCurrentSession?: string) {
  try {
    const supabase = createServerSupabaseClient()

    let query = supabase.from("admin_sessions").update({ is_active: false }).eq("user_id", userId).eq("is_active", true)

    if (exceptCurrentSession) {
      query = query.neq("id", exceptCurrentSession)
    }

    const { error } = await query

    if (error) {
      console.error("Error terminating all admin sessions:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Exception in terminateAllAdminSessions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
