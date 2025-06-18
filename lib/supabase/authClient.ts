import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"

let browserClientInstance: any = null
let serverClientInstance: any = null

export function createServerClient() {
  if (serverClientInstance) {
    return serverClientInstance
  }

  const cookieStore = cookies()

  serverClientInstance = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

  return serverClientInstance
}

export function createBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("createBrowserClient should only be called on the client side")
  }

  if (browserClientInstance) {
    return browserClientInstance
  }

  browserClientInstance = createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return browserClientInstance
}

export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({
          name,
          value,
          ...options,
        })
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: any) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        })
        response.cookies.set({
          name,
          value: "",
          ...options,
        })
      },
    },
  })
}
