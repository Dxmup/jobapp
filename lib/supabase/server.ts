/**
 * Supabase Server Client Module
 *
 * This module provides functions to create Supabase clients for server-side operations.
 * It includes different client creation methods with varying permission levels.
 *
 * @module supabase/server
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/**
 * Creates a Supabase client with service role privileges for server-side operations.
 *
 * This client has full access to the database and bypasses Row Level Security (RLS).
 * It should be used with caution and only for server-side operations that require
 * elevated privileges.
 *
 * @deprecated Use createAdminSupabaseClient instead for clarity
 * @returns A Supabase client with service role privileges
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  // Check if environment variables exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase server environment variables are missing!")
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
    auth: {
      persistSession: false,
    },
  })
}

/**
 * Creates a Supabase client with anonymous privileges for server-side operations.
 *
 * This client respects Row Level Security (RLS) policies and is suitable for
 * operations that should be restricted by user permissions.
 *
 * @param cookieStore - The Next.js cookies store
 * @returns A Supabase client with anonymous privileges
 */
export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  // Check if environment variables exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase client environment variables are missing!")
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
        flowType: "pkce",
      },
      global: {
        headers: { "Content-Type": "application/json" },
      },
    },
  )
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

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
    auth: {
      persistSession: false,
    },
    global: {
      headers: { "Content-Type": "application/json" },
    },
  })
}

/**
 * Named export alias for createSupabaseClient to match expected import
 */
export const createClient = createSupabaseClient
