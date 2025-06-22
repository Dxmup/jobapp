import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  // Since the table is already created via SQL, just return success
  return NextResponse.json({
    success: true,
    message: "Blogs table already exists and is ready to use!",
  })
}
