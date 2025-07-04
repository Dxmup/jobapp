/**
 * Supabase Client Module
 *
 * This module provides a singleton Supabase client for client-side operations.
 * It ensures that only one instance of the Supabase client is created and reused
 * throughout the application.
 *
 * @module supabase/client
 */

import { createClient } from "@supabase/supabase-js"

// Global singleton instance
let supabaseClient: ReturnType<typeof createClient> | null = null

/**
 * Gets or creates a Supabase client for client-side operations.
 * Uses proper singleton pattern to prevent multiple instances.
 */
export function getSupabaseClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  // Check if environment variables exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase environment variables are missing!")
    throw new Error("Supabase environment variables are missing!")
  }

  // Create a new client only once
  supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false, // Disable session persistence since we use cookies
      autoRefreshToken: false, // Disable auto refresh since we use cookies
      detectSessionInUrl: false, // Disable URL session detection
    },
  })

  return supabaseClient
}

/**
 * Exported singleton instance of the Supabase client.
 * Use this for client-side operations.
 */
export const supabase = getSupabaseClient()
