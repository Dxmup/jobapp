import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server" // Assuming your server-side Supabase client
import { directSql } from "@/lib/supabase/direct-sql" // Assuming a utility to run raw SQL

export async function POST() {
  const supabase = createClient()

  // Basic authentication check (e.g., ensure only admin can run this)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // You might want to add more robust admin role checking here
  // For example, check if the user has an 'admin' role in your user_profiles table

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS public.waitlist (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email);
  `

  try {
    const { data, error } = await directSql(createTableSql)

    if (error) {
      console.error("Error creating waitlist table:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Waitlist table created successfully." }, { status: 200 })
  } catch (e) {
    console.error("Unexpected error during waitlist table creation:", e)
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 })
  }
}
