import { createServerSupabaseClient } from "../lib/supabase/server"
import { assignRoleToUser } from "../app/actions/role-actions"
import crypto from "crypto"

// Generate a secure random password
function generateSecurePassword(length = 16) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+"
  let password = ""
  const randomValues = crypto.randomBytes(length)

  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % charset.length
    password += charset[randomIndex]
  }

  return password
}

export async function createMasterAdmin() {
  try {
    const supabase = createServerSupabaseClient()

    // Create master admin credentials
    const adminEmail = "master-admin@careerai.app"
    const adminPassword = generateSecurePassword(20)
    const adminName = "Master Administrator"

    // Check if admin already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", adminEmail).single()

    let userId

    if (existingUser) {
      console.log("Master admin already exists, updating credentials...")
      userId = existingUser.id

      // Update the auth user password
      await supabase.auth.admin.updateUserById(userId, {
        password: adminPassword,
      })
    } else {
      console.log("Creating new master admin account...")

      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      })

      if (authError || !authUser.user) {
        throw new Error(`Failed to create auth user: ${authError?.message}`)
      }

      // Create user record
      const { data: user, error: userError } = await supabase
        .from("users")
        .insert({
          auth_id: authUser.user.id,
          email: adminEmail,
          name: adminName,
          created_at: new Date(),
          updated_at: new Date(),
          last_login: new Date(),
          is_active: true,
        })
        .select()
        .single()

      if (userError || !user) {
        throw new Error(`Failed to create user record: ${userError?.message}`)
      }

      userId = user.id
    }

    // Assign super_admin role
    const roleResult = await assignRoleToUser(userId, "super_admin")

    if (!roleResult.success) {
      throw new Error(`Failed to assign super_admin role: ${roleResult.error}`)
    }

    return {
      success: true,
      email: adminEmail,
      password: adminPassword,
      message: "Master admin account created successfully",
    }
  } catch (error) {
    console.error("Error creating master admin:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
