import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing Supabase URL or service role key" }, { status: 500 })
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if the table exists
    const { error: checkError } = await supabase.from("interview_questions").select("id").limit(1)

    // If the table exists, we're done
    if (!checkError) {
      return NextResponse.json({ success: true, message: "Table already exists" })
    }

    // Create the table with minimal dependencies
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        -- Create a simple version of the table without foreign keys first
        CREATE TABLE IF NOT EXISTS public.interview_questions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          job_id UUID NOT NULL,
          user_id UUID NOT NULL,
          resume_id UUID,
          technical_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
          behavioral_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE IF EXISTS public.interview_questions ENABLE ROW LEVEL SECURITY;
        
        -- Create a basic policy
        CREATE POLICY IF NOT EXISTS "Users can manage their own interview questions"
        ON public.interview_questions
        USING (auth.uid() = user_id);
      `,
    })

    if (error) {
      // If the exec_sql function doesn't exist, try a different approach
      if (error.message.includes("function") && error.message.includes("exec_sql")) {
        // Try to create the table using a direct query
        // This is a workaround since we can't execute arbitrary SQL directly

        // First, check if we can access the database at all
        const { data: testData, error: testError } = await supabase.from("jobs").select("id").limit(1)

        if (testError) {
          return NextResponse.json({ error: `Database access error: ${testError.message}` }, { status: 500 })
        }

        return NextResponse.json({
          success: false,
          message: "Could not create table - exec_sql function not available. Please create the table manually.",
          sql: `
            CREATE TABLE IF NOT EXISTS public.interview_questions (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              job_id UUID NOT NULL,
              user_id UUID NOT NULL,
              resume_id UUID,
              technical_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
              behavioral_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            ALTER TABLE IF EXISTS public.interview_questions ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can manage their own interview questions"
            ON public.interview_questions
            USING (auth.uid() = user_id);
          `,
        })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Interview questions table created successfully" })
  } catch (error) {
    console.error("Error creating table:", error)
    return NextResponse.json(
      {
        error: `Failed to create table: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
