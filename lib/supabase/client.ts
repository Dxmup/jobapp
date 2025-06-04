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

// Singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

/**
 * Exported singleton instance of the Supabase client.
 * Use this for client-side operations.
 */
export const supabase = getSupabaseClient()

/**
 * Gets or creates a Supabase client for client-side operations.
 *
 * This function implements the singleton pattern to ensure that only one
 * instance of the Supabase client is created and reused throughout the
 * application.
 *
 * @returns A Supabase client for client-side operations
 * @throws Error if environment variables are missing
 */
export function getSupabaseClient() {
  // Return existing client if already created
  if (supabaseClient) return supabaseClient

  // Check if environment variables exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase environment variables are missing!")
    throw new Error("Supabase environment variables are missing!")
  }

  // Create a new client
  supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      storageKey: "supabase-auth",
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseClient
}
