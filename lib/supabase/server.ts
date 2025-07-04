import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a Supabase client for server-side operations
export function createClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Alias for createClient to match expected exports
export function createServerSupabaseClient() {
  return createClient()
}

// Another alias for createClient to match expected exports
export function createServerClient() {
  return createClient()
}
