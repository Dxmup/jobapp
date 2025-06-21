import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

let serverSupabaseClient: any = null

export function createServerSupabaseClient() {
  if (serverSupabaseClient) {
    return serverSupabaseClient
  }

  const cookieStore = cookies()

  serverSupabaseClient = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  return serverSupabaseClient
}
