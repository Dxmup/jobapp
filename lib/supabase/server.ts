import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServerClient as createSSRClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Creates a Supabase client with service role privileges for server-side operations.
 * This client has full access to the database and bypasses Row Level Security (RLS).
 */
export function createServerSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  })
}

/**
 * Creates a Supabase client with user session for server-side operations.
 * This client respects Row Level Security (RLS) policies.
 */
export function createServerClient() {
  const cookieStore = cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSSRClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}

/**
 * Creates a standard Supabase client - alias for createServerSupabaseClient
 */
export function createClient() {
  return createServerSupabaseClient()
}

// Export the default client creation function
export default createServerSupabaseClient
