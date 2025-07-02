/**
 * Supabase Server Client Module
 *
 * This module provides functions to create Supabase clients for server-side operations.
 * It includes different client creation methods with varying permission levels.
 *
 * @module supabase/server
 */

import { createClient } from "@supabase/supabase-js"
import { createServerClient as createSSRClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Creates a Supabase client with service role privileges for server-side operations.
 *
 * This client has full access to the database and bypasses Row Level Security (RLS).
 * It should be used with caution and only for server-side operations that require
 * elevated privileges.
 *
 * @returns A Supabase client with service role privileges
 */
export function createServerSupabaseClient() {
  // Check if environment variables exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase server environment variables are missing!")
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
    auth: {
      persistSession: false,
    },
  })
}

/**
 * Creates a Supabase client with user session for server-side operations.
 *
 * This client respects Row Level Security (RLS) policies and is suitable for
 * operations that should be restricted by user permissions.
 *
 * @returns A Supabase client with user session
 */
export function createServerClient() {
  const cookieStore = cookies()

  // Check if environment variables exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase client environment variables are missing!")
  }

  return createSSRClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

/**
 * Creates a Supabase client with admin privileges for server-side operations.
 *
 * This client has full access to the database and bypasses Row Level Security (RLS).
 * It should be used with caution and only for administrative operations.
 *
 * @returns A Supabase client with admin privileges
 */
export function createAdminSupabaseClient() {
  // Check if environment variables exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase admin environment variables are missing!")
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
    auth: {
      persistSession: false,
    },
    global: {
      headers: { "Content-Type": "application/json" },
    },
  })
}

// Re-export createClient for compatibility
export { createClient }
