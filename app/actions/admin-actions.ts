"use server"

import { cookies } from "next/headers"
import { headers } from "next/headers"
import { hasPermission, logAuditEvent } from "@/lib/auth-service"
import { revalidatePath } from "next/cache"

// Helper function to get request metadata for audit logging
async function getRequestMetadata() {
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const headersList = headers()
  const userAgent = headersList.get("user-agent") || "Unknown"
  const ip = headersList.get("x-forwarded-for") || "127.0.0.1"

  return {
    userId,
    ip: ip.split(",")[0],
    userAgent,
  }
}

// Example: Update user status
export async function updateUserStatus(userId: string, isActive: boolean) {
  try {
    const { userId: adminId, ip, userAgent } = await getRequestMetadata()

    // Check permission
    const canUpdateUsers = await hasPermission(adminId, "user:update")

    if (!canUpdateUsers) {
      throw new Error("Forbidden")
    }

    // In a real app, you would update the user in the database
    console.log(`Updating user ${userId} status to ${isActive}`)

    // Log the action
    await logAuditEvent(adminId, "update", "user", userId, { field: "isActive", value: isActive }, ip, userAgent)

    // Revalidate the users page
    revalidatePath("/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Error updating user status:", error)
    return { error: error instanceof Error ? error.message : "An error occurred" }
  }
}

// Example: Delete content
export async function deleteContent(contentId: string) {
  try {
    const { userId, ip, userAgent } = await getRequestMetadata()

    // Check permission
    const canDeleteContent = await hasPermission(userId, "content:delete")

    if (!canDeleteContent) {
      throw new Error("Forbidden")
    }

    // In a real app, you would delete the content from the database
    console.log(`Deleting content ${contentId}`)

    // Log the action
    await logAuditEvent(userId, "delete", "content", contentId, {}, ip, userAgent)

    // Revalidate the content page
    revalidatePath("/admin/content")

    return { success: true }
  } catch (error) {
    console.error("Error deleting content:", error)
    return { error: error instanceof Error ? error.message : "An error occurred" }
  }
}

// Example: Update system settings
export async function updateSystemSettings(settings: Record<string, any>) {
  try {
    const { userId, ip, userAgent } = await getRequestMetadata()

    // Check permission
    const canManageSystem = await hasPermission(userId, "system:manage")

    if (!canManageSystem) {
      throw new Error("Forbidden")
    }

    // In a real app, you would update the settings in the database
    console.log("Updating system settings:", settings)

    // Log the action
    await logAuditEvent(userId, "update", "system", null, settings, ip, userAgent)

    // Revalidate the settings page
    revalidatePath("/admin/settings")

    return { success: true }
  } catch (error) {
    console.error("Error updating system settings:", error)
    return { error: error instanceof Error ? error.message : "An error occurred" }
  }
}
