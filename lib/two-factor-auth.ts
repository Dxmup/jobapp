import { createServerSupabaseClient } from "./supabase/server"
import { authenticator } from "otplib"
import crypto from "crypto"

// Generate backup codes
function generateBackupCodes(count = 10, length = 8) {
  const codes = []
  for (let i = 0; i < count; i++) {
    const code = crypto
      .randomBytes(length / 2)
      .toString("hex")
      .toUpperCase()
    codes.push(code)
  }
  return codes
}

export async function setupTwoFactorAuth(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if 2FA is already set up
    const { data: existingSetup } = await supabase.from("two_factor_auth").select("*").eq("user_id", userId).single()

    if (existingSetup) {
      return {
        success: false,
        error: "Two-factor authentication is already set up for this user",
        isEnabled: existingSetup.is_enabled,
      }
    }

    // Generate a secret key
    const secret = authenticator.generateSecret()

    // Generate backup codes
    const backupCodes = generateBackupCodes()

    // Store in database (not enabled yet)
    const { data, error } = await supabase
      .from("two_factor_auth")
      .insert({
        user_id: userId,
        secret,
        is_enabled: false,
        backup_codes: JSON.stringify(backupCodes),
      })
      .select()
      .single()

    if (error) {
      console.error("Error setting up 2FA:", error)
      return { success: false, error: error.message }
    }

    // Get user info for the QR code
    const { data: user } = await supabase.from("users").select("email").eq("id", userId).single()

    const appName = "CareerAI Admin"
    const otpAuthUrl = authenticator.keyuri(user?.email || userId, appName, secret)

    return {
      success: true,
      secret,
      otpAuthUrl,
      backupCodes,
    }
  } catch (error) {
    console.error("Exception in setupTwoFactorAuth:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function verifyAndEnableTwoFactorAuth(userId: string, token: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the 2FA setup
    const { data, error } = await supabase.from("two_factor_auth").select("*").eq("user_id", userId).single()

    if (error || !data) {
      return { success: false, error: "Two-factor authentication not set up" }
    }

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret: data.secret,
    })

    if (!isValid) {
      return { success: false, error: "Invalid verification code" }
    }

    // Enable 2FA
    const { error: updateError } = await supabase.from("two_factor_auth").update({ is_enabled: true }).eq("id", data.id)

    if (updateError) {
      console.error("Error enabling 2FA:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Exception in verifyAndEnableTwoFactorAuth:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function verifyTwoFactorToken(userId: string, token: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the 2FA setup
    const { data, error } = await supabase.from("two_factor_auth").select("*").eq("user_id", userId).single()

    if (error || !data) {
      return { success: false, error: "Two-factor authentication not set up" }
    }

    if (!data.is_enabled) {
      return { success: false, error: "Two-factor authentication is not enabled" }
    }

    // Check if it's a backup code
    const backupCodes = JSON.parse(data.backup_codes || "[]")
    const backupCodeIndex = backupCodes.indexOf(token)

    if (backupCodeIndex >= 0) {
      // Remove the used backup code
      backupCodes.splice(backupCodeIndex, 1)

      // Update backup codes in database
      await supabase
        .from("two_factor_auth")
        .update({ backup_codes: JSON.stringify(backupCodes) })
        .eq("id", data.id)

      return { success: true, usedBackupCode: true }
    }

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret: data.secret,
    })

    return { success: isValid, usedBackupCode: false }
  } catch (error) {
    console.error("Exception in verifyTwoFactorToken:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function disableTwoFactorAuth(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("two_factor_auth").delete().eq("user_id", userId)

    if (error) {
      console.error("Error disabling 2FA:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Exception in disableTwoFactorAuth:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function regenerateBackupCodes(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Generate new backup codes
    const backupCodes = generateBackupCodes()

    // Update in database
    const { error } = await supabase
      .from("two_factor_auth")
      .update({ backup_codes: JSON.stringify(backupCodes) })
      .eq("user_id", userId)

    if (error) {
      console.error("Error regenerating backup codes:", error)
      return { success: false, error: error.message }
    }

    return { success: true, backupCodes }
  } catch (error) {
    console.error("Exception in regenerateBackupCodes:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function isTwoFactorEnabled(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("two_factor_auth").select("is_enabled").eq("user_id", userId).single()

    if (error) {
      return { enabled: false }
    }

    return { enabled: data?.is_enabled || false }
  } catch (error) {
    console.error("Exception in isTwoFactorEnabled:", error)
    return { enabled: false }
  }
}
