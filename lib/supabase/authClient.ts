import { cookies } from "next/headers"
import {
  createRouteHandlerClient,
  createServerComponentClient,
  createMiddlewareSupabaseClient,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/types/database"
import type { NextRequest, NextResponse } from "next/server"

export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies })

export const createRouteClient = () =>
  createRouteHandlerClient<Database>({ cookies })

export const createMiddlewareClient = (req: NextRequest, res: NextResponse) =>
  createMiddlewareSupabaseClient<Database>({ req, res })

export const createBrowserClient = () =>
  createClientComponentClient<Database>()
