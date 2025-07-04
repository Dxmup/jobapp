import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUserIdOptional } from "@/lib/auth-cookie"
import { isUserAdmin } from "@/lib/auth-service"

export async function POST() {
  try {
    const userId = await getCurrentUserIdOptional()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const supabase = createServerSupabaseClient()

    // Add deletion tracking fields to users table
    const addFieldsQuery = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS marked_for_deletion BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deletion_date TIMESTAMP WITH TIME ZONE;
    `

    const { error: addFieldsError } = await supabase.rpc("exec_sql", {
      sql_query: addFieldsQuery,
    })

    if (addFieldsError) {
      console.error("Error adding deletion fields:", addFieldsError)
      return NextResponse.json(
        { error: "Failed to add deletion fields", details: addFieldsError.message },
        { status: 500 },
      )
    }

    // Create index for efficient querying
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_users_marked_for_deletion 
      ON users (marked_for_deletion, deletion_date) 
      WHERE marked_for_deletion = TRUE;
    `

    const { error: indexError } = await supabase.rpc("exec_sql", {
      sql_query: createIndexQuery,
    })

    if (indexError) {
      console.error("Error creating index:", indexError)
      return NextResponse.json({ error: "Failed to create index", details: indexError.message }, { status: 500 })
    }

    // Create audit_logs table if it doesn't exist
    const createAuditLogsQuery = `
      CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          action TEXT NOT NULL,
          resource TEXT NOT NULL,
          resource_id TEXT,
          details JSONB DEFAULT '{}',
          ip_address TEXT,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: auditLogsError } = await supabase.rpc("exec_sql", {
      sql_query: createAuditLogsQuery,
    })

    if (auditLogsError) {
      console.error("Error creating audit_logs table:", auditLogsError)
      return NextResponse.json(
        { error: "Failed to create audit_logs table", details: auditLogsError.message },
        { status: 500 },
      )
    }

    // Create audit logs indexes
    const createAuditIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action 
      ON audit_logs (user_id, action, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
      ON audit_logs (created_at DESC);
    `

    const { error: auditIndexError } = await supabase.rpc("exec_sql", {
      sql_query: createAuditIndexesQuery,
    })

    if (auditIndexError) {
      console.error("Error creating audit indexes:", auditIndexError)
      return NextResponse.json(
        { error: "Failed to create audit indexes", details: auditIndexError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "User deletion fields and audit logs table created successfully",
    })
  } catch (error) {
    console.error("Exception in add-user-deletion-fields:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
