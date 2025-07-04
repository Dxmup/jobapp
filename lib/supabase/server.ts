import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createSupabaseClient(supabaseUrl, supabaseKey)
}

export function createServerSupabaseClient() {
  return createServerClient()
}

export function createClient() {
  return createServerClient()
}
