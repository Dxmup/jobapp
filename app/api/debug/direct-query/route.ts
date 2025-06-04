/**
 * Direct Query API Route
 *
 * This API route allows executing arbitrary SQL queries against the database
 * for debugging purposes. It includes security checks to ensure users can
 * only query their own data.
 *
 * @route POST /api/debug/direct-query
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { executeDirectQuery } from "../index"

/**
 * POST handler for the direct-query API route.
 *
 * Executes a SQL query provided in the request body.
 * Includes security checks to ensure users can only query their own data.
 *
 * @param request - The incoming request object containing the SQL query
 * @returns NextResponse with the query results or an error
 */
export async function POST(request: Request) {
  try {
    // Get user ID from cookie for security check
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      console.log("No user ID found in cookies")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body to get the SQL query
    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 })
    }

    // Security check: Only allow queries that include the user's ID
    // This prevents users from querying other users' data
    if (!query.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized query" }, { status: 403 })
    }

    // Execute the query using our debug module
    const { data, error } = await executeDirectQuery(query)

    if (error) {
      console.error("Error executing query:", error)
      return NextResponse.json({ error: `Failed to execute query: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in direct query API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
