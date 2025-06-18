import {
  createServerClient as createSupabaseServerClient,
  createBrowserClient as createSupabaseBrowserClient,
  type CookieOptions, // Import CookieOptions
} from "@supabase/ssr"
import { cookies } from "next/headers"

// Global singleton instances
let browserClientInstance: any = null // Renamed for clarity

// Server client should NOT be a singleton. It's created per request.
export function createServerClient() {
  const cookieStore = cookies()

  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        // Use CookieOptions type
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // This can happen if you try to set cookies from a Server Component.
          // Actions, Route Handlers, and Middleware are fine.
          console.warn(`[createServerClient] Error setting cookie '${name}':`, error)
        }
      },
      remove(name: string, options: CookieOptions) {
        // Use CookieOptions type
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Same as above
          console.warn(`[createServerClient] Error removing cookie '${name}':`, error)
        }
      },
    },
  })
}

export function createBrowserClient() {
  if (typeof window === "undefined") {
    // This case should ideally not be hit if used correctly,
    // but good for a warning during development.
    console.warn(
      "[createBrowserClient] Attempted to call on the server. Returning a server client instead to prevent hard errors, but this indicates a potential misuse.",
    )
    // Fallback to a server client to avoid crashing, but this is not ideal.
    // The real fix is to ensure createBrowserClient is only called client-side.
    return createServerClient() // Or throw an error if preferred
  }

  if (!browserClientInstance) {
    console.log("[createBrowserClient] Initializing new browser client instance.")
    browserClientInstance = createSupabaseBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return browserClientInstance
}
