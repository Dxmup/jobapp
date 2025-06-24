import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { executeSql } from "@/lib/supabase/direct-sql"
import { generateStrongPassword } from "@/lib/auth-utils"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Generate credentials
    const email = "master-admin@careerai.app"
    const password = generateStrongPassword()
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if roles table exists, if not create it
    const { data: tablesData } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "roles")

    if (!tablesData || tablesData.length === 0) {
      // Create roles table
      const createRolesTableSql = `
        CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS user_roles (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, role_id)
        );
        
        -- Insert default roles
        INSERT INTO roles (name, description) 
        VALUES 
          ('user', 'Regular user with standard permissions'),
          ('admin', 'Administrator with elevated permissions'),
          ('super_admin', 'Super administrator with full system access'),
          ('editor', 'Content editor with publishing permissions')
        ON CONFLICT (name) DO NOTHING;
      `

      const { success, error } = await executeSql(createRolesTableSql)
      if (!success) {
        return NextResponse.json({ success: false, error }, { status: 500 })
      }
    }

    // Check if user exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    let userId

    if (existingUser) {
      // Update existing user
      userId = existingUser.id
      await supabase
        .from("users")
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          email,
          password_hash: hashedPassword,
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      userId = newUser.id
    }

    // Get super_admin role id
    const { data: roleData } = await supabase.from("roles").select("id").eq("name", "super_admin").single()

    if (!roleData) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not find super_admin role",
        },
        { status: 500 },
      )
    }

    // Assign super_admin role to user
    await supabase.from("user_roles").upsert(
      {
        user_id: userId,
        role_id: roleData.id,
      },
      {
        onConflict: "user_id,role_id",
      },
    )

    return NextResponse.json({
      success: true,
      message: "Master admin created successfully",
      credentials: {
        email,
        password,
      },
    })
  } catch (error) {
    console.error("Exception in create-master-admin:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
