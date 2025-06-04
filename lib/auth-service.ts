import { cookies } from "next/headers"
import type { Role, Permission, User, AuditLog } from "@/types/auth"
import { createServerSupabaseClient } from "./supabase/server"

// Store for users - in a real app, this would be a database
// This will be our in-memory "database" for this demo
const users: Record<string, { user: User; roles: Role[] }> = {}

// Mock permissions - keeping these for the role-based system
const permissions: Record<string, Permission> = {
  "user:read": {
    id: "user:read",
    name: "Read Users",
    description: "Can view user information",
    resource: "user",
    action: "read",
  },
  "user:create": {
    id: "user:create",
    name: "Create Users",
    description: "Can create new users",
    resource: "user",
    action: "create",
  },
  "user:update": {
    id: "user:update",
    name: "Update Users",
    description: "Can update user information",
    resource: "user",
    action: "update",
  },
  "user:delete": {
    id: "user:delete",
    name: "Delete Users",
    description: "Can delete users",
    resource: "user",
    action: "delete",
  },
  "content:read": {
    id: "content:read",
    name: "Read Content",
    description: "Can view content",
    resource: "content",
    action: "read",
  },
  "content:create": {
    id: "content:create",
    name: "Create Content",
    description: "Can create new content",
    resource: "content",
    action: "create",
  },
  "content:update": {
    id: "content:update",
    name: "Update Content",
    description: "Can update content",
    resource: "content",
    action: "update",
  },
  "content:delete": {
    id: "content:delete",
    name: "Delete Content",
    description: "Can delete content",
    resource: "content",
    action: "delete",
  },
  "billing:read": {
    id: "billing:read",
    name: "Read Billing",
    description: "Can view billing information",
    resource: "billing",
    action: "read",
  },
  "billing:manage": {
    id: "billing:manage",
    name: "Manage Billing",
    description: "Can manage billing",
    resource: "billing",
    action: "manage",
  },
  "system:read": {
    id: "system:read",
    name: "Read System",
    description: "Can view system information",
    resource: "system",
    action: "read",
  },
  "system:manage": {
    id: "system:manage",
    name: "Manage System",
    description: "Can manage system settings",
    resource: "system",
    action: "manage",
  },
}

// Role to permissions mapping
const rolePermissions: Record<Role, string[]> = {
  user: [],
  support: ["user:read", "content:read"],
  editor: ["content:read", "content:create", "content:update"],
  admin: [
    "user:read",
    "user:create",
    "user:update",
    "content:read",
    "content:create",
    "content:update",
    "content:delete",
    "billing:read",
    "system:read",
  ],
  super_admin: Object.keys(permissions),
}

// Audit logs storage
const auditLogs: AuditLog[] = []

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // In a real app, you would verify the password here with proper hashing
  // For now, we'll accept any password for registered users
  const userRecord = users[email.toLowerCase()]

  if (!userRecord) {
    return null
  }

  // Update last login
  userRecord.user.lastLogin = new Date()

  return userRecord.user
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("users").select("*").eq("email", email.toLowerCase()).single()

    if (error || !data) {
      return null
    }

    return data as User
  } catch (error) {
    console.error("Error in getUserByEmail:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    console.log("Getting user by ID:", id)
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching user by ID:", error)
      return null
    }

    if (!data) {
      console.log("No user found with ID:", id)
      return null
    }

    console.log("User found:", data.id)
    return data as User
  } catch (error) {
    console.error("Exception in getUserById:", error)
    return null
  }
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  const userEmail = Object.keys(users).find((email) => users[email].user.id === userId)
  return userEmail ? users[userEmail].roles : []
}

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const roles = await getUserRoles(userId)
  const permissionIds = new Set<string>()

  roles.forEach((role) => {
    rolePermissions[role].forEach((permId) => {
      permissionIds.add(permId)
    })
  })

  return Array.from(permissionIds).map((id) => permissions[id])
}

export async function hasPermission(userId: string, permissionId: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  return userPermissions.some((p) => p.id === permissionId)
}

export async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  resourceId: string | null = null,
  details: Record<string, any> = {},
  ipAddress = "127.0.0.1",
  userAgent = "Unknown",
): Promise<void> {
  const auditLog: AuditLog = {
    id: Date.now().toString(),
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
    createdAt: new Date(),
  }

  // In a real app, you would save to the database
  auditLogs.push(auditLog)
  console.log("Audit log created:", auditLog)
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    return null
  }

  return await getUserById(userId)
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return roles.includes("admin") || roles.includes("super_admin")
}

export async function getAuditLogs(
  filters: {
    userId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
  } = {},
  page = 1,
  pageSize = 20,
): Promise<{ logs: AuditLog[]; total: number }> {
  let filteredLogs = [...auditLogs]

  if (filters.userId) {
    filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId)
  }

  if (filters.action) {
    filteredLogs = filteredLogs.filter((log) => log.action === filters.action)
  }

  if (filters.resource) {
    filteredLogs = filteredLogs.filter((log) => log.resource === filters.resource)
  }

  if (filters.startDate) {
    filteredLogs = filteredLogs.filter((log) => log.createdAt >= filters.startDate)
  }

  if (filters.endDate) {
    filteredLogs = filteredLogs.filter((log) => log.createdAt <= filters.endDate)
  }

  // Sort by createdAt descending
  filteredLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    logs: filteredLogs.slice(start, end),
    total: filteredLogs.length,
  }
}

// Function to add a new user (for signup)
export async function addUser(userData: {
  name: string
  email: string
  password: string // In a real app, this would be hashed
}): Promise<User | null> {
  // Check if user already exists
  if (users[userData.email.toLowerCase()]) {
    return null
  }

  // Generate a unique ID
  const userId = `user_${Date.now()}`

  // Create a new user
  const newUser: User = {
    id: userId,
    email: userData.email.toLowerCase(),
    name: userData.name,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
    isActive: true,
  }

  // Add user to our "database"
  users[userData.email.toLowerCase()] = {
    user: newUser,
    roles: ["user"], // New users get basic user role
  }

  console.log(`New user created: ${newUser.email}`)
  return newUser
}

// For development/testing - add an admin user if needed
export function ensureAdminUser() {
  const adminEmail = "admin@example.com"
  if (!users[adminEmail]) {
    const adminUser: User = {
      id: "admin_user",
      email: adminEmail,
      name: "Admin User",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
    }

    users[adminEmail] = {
      user: adminUser,
      roles: ["user", "admin"],
    }

    console.log("Admin user created for testing")
  }
}

// Call this function to ensure we have an admin user for testing
ensureAdminUser()
