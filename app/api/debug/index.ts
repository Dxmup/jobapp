/**
 * Debug Utilities Module
 *
 * This module provides centralized access to debugging functionality for the application.
 * It contains utility functions for direct database access, query execution, and data manipulation
 * that bypass normal application flow for troubleshooting purposes.
 *
 * IMPORTANT: This module is intended for development and troubleshooting only.
 * It uses the Supabase service role key which has full access to the database.
 *
 * @module debug
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"

/**
 * Creates a Supabase client with service role privileges that bypasses Row Level Security (RLS).
 *
 * This client has full access to the database and should be used with caution.
 * It's intended for debugging and administrative tasks only.
 *
 * @returns A Supabase client with service role privileges
 * @throws Error if environment variables are missing
 */
export function createDebugSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or service role key")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

/**
 * Executes a direct SQL query against the database.
 *
 * This function uses the exec_sql stored procedure to run arbitrary SQL.
 * It should be used with caution and only for debugging purposes.
 *
 * @param query - The SQL query to execute
 * @returns Promise resolving to the query results
 */
export async function executeDirectQuery(query: string) {
  const supabase = createDebugSupabaseClient()
  return await supabase.rpc("exec_sql", { sql_query: query })
}

/**
 * Retrieves all resumes for a specific user.
 *
 * This function bypasses RLS policies and directly queries the resumes table.
 *
 * @param userId - The ID of the user whose resumes to retrieve
 * @returns Promise resolving to the user's resumes
 */
export async function getAllResumesForUser(userId: string) {
  const supabase = createDebugSupabaseClient()
  return await supabase.from("resumes").select("*").eq("user_id", userId).order("created_at", { ascending: false })
}

/**
 * Updates the ownership of a resume to a different user.
 *
 * This function is used to fix ownership issues where resumes are associated
 * with the wrong user ID.
 *
 * @param resumeId - The ID of the resume to update
 * @param userId - The ID of the user who should own the resume
 * @returns Promise resolving to the update result
 */
export async function fixResumeOwnership(resumeId: string, userId: string) {
  const supabase = createDebugSupabaseClient()
  return await supabase.from("resumes").update({ user_id: userId }).eq("id", resumeId)
}

/**
 * Retrieves all users who have resumes in the system.
 *
 * This function executes a SQL query to get a list of user IDs and their resume counts.
 *
 * @returns Promise resolving to users with resume counts
 */
export async function getUsersWithResumes() {
  const supabase = createDebugSupabaseClient()
  return await supabase.rpc("exec_sql", {
    sql_query: `
      SELECT DISTINCT user_id, COUNT(*) as resume_count
      FROM resumes
      GROUP BY user_id
      ORDER BY resume_count DESC
    `,
  })
}
