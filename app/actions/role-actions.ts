"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Role } from "@/types/auth"

export async function assignRoleToUser(userId: string, roleName: Role) {
  try {
    const supabase = createServerSupabaseClient()

    // First, get the role ID
    const { data: roleData, error: roleError } = await supabase.from("roles").select("id").eq("name", roleName).single()

    if (roleError || !roleData) {
      console.error("Error fetching role:", roleError)
      return { success: false, error: `Role ${roleName} not found` }
    }

    // Then assign the role to the user
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role_id: roleData.id })

    if (error) {
      // If it's a duplicate key error, the role is already assigned
      if (error.code === "23505") {
        return { success: true, message: `User already has role ${roleName}` }
      }

      console.error("Error assigning role:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: `Role ${roleName} assigned to user ${userId}` }
  } catch (error) {
    console.error("Exception in assignRoleToUser:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function removeRoleFromUser(userId: string, roleName: Role) {
  try {
    const supabase = createServerSupabaseClient()

    // First, get the role ID
    const { data: roleData, error: roleError } = await supabase.from("roles").select("id").eq("name", roleName).single()

    if (roleError || !roleData) {
      console.error("Error fetching role:", roleError)
      return { success: false, error: `Role ${roleName} not found` }
    }

    // Then remove the role from the user
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role_id", roleData.id)

    if (error) {
      console.error("Error removing role:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: `Role ${roleName} removed from user ${userId}` }
  } catch (error) {
    console.error("Exception in removeRoleFromUser:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getUserRolesWithDetails(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("user_roles")
      .select("roles(id, name, description)")
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching user roles:", error)
      return { success: false, error: error.message, roles: [] }
    }

    const roles = data.map((item) => ({
      id: item.roles.id,
      name: item.roles.name,
      description: item.roles.description,
    }))

    return { success: true, roles }
  } catch (error) {
    console.error("Exception in getUserRolesWithDetails:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      roles: [],
    }
  }
}
