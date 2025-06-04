import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ensureDatabaseTables } from "@/lib/migrations/ensure-tables"

// Track if migrations have been run
let migrationsRun = false

export async function middleware(request: NextRequest) {
  // Run migrations only once per server instance
  if (!migrationsRun) {
    try {
      await ensureDatabaseTables()
      migrationsRun = true
      console.log("Database migrations completed successfully")
    } catch (error) {
      console.error("Failed to run migrations:", error)
    }
  }

  return NextResponse.next()
}
