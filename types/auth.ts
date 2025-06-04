export type Role = "user" | "support" | "editor" | "admin" | "super_admin"

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: "create" | "read" | "update" | "delete" | "manage"
}

export interface RolePermission {
  roleId: string
  permissionId: string
}

export interface UserRole {
  userId: string
  roleId: string
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
  lastLogin: Date | null
  isActive: boolean
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string | null
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: Date
}
