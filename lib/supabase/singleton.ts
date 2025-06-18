import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Global singleton instances
let browserClient: any = null
const serverClient: any = null

export function createServerClient() {
  // Always create a fresh server client for each request
  // Server clients can't be singletons due to request isolation
  const cookieStore = cookies()

  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Ignore - called from Server Component
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Ignore - called from Server Component
        }
      },
    },
  })
}

export function createBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("createBrowserClient should only be called on the client side")
  }

  // Use singleton for browser client
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  return browserClient
}
