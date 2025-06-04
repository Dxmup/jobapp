import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create a Supabase client with the service role key
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or service role key")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    // Execute the SQL directly using the service role client
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        -- Create the exec_sql function if it doesn't exist
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Now create the interview_questions table
        CREATE TABLE IF NOT EXISTS public.interview_questions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
          technical_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
          behavioral_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE IF EXISTS public.interview_questions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'interview_questions' 
            AND policyname = 'Users can view their own interview questions'
          ) THEN
            CREATE POLICY "Users can view their own interview questions"
            ON public.interview_questions
            FOR SELECT
            USING (auth.uid() = user_id);
          END IF;

          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'interview_questions' 
            AND policyname = 'Users can insert their own interview questions'
          ) THEN
            CREATE POLICY "Users can insert their own interview questions"
            ON public.interview_questions
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
          END IF;

          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'interview_questions' 
            AND policyname = 'Users can update their own interview questions'
          ) THEN
            CREATE POLICY "Users can update their own interview questions"
            ON public.interview_questions
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
          END IF;

          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'interview_questions' 
            AND policyname = 'Users can delete their own interview questions'
          ) THEN
            CREATE POLICY "Users can delete their own interview questions"
            ON public.interview_questions
            FOR DELETE
            USING (auth.uid() = user_id);
          END IF;
        END
        $$;
      `,
    })

    if (error) {
      console.error("Error executing SQL:", error)

      // If the exec_sql function doesn't exist, try creating the table directly
      if (error.message.includes("function") && error.message.includes("exec_sql")) {
        console.log("Trying direct SQL execution...")

        // Try direct SQL execution
        const { error: directError } = await supabase
          .from("interview_questions")
          .insert({
            id: "00000000-0000-0000-0000-000000000000", // Dummy row that will fail
            job_id: "00000000-0000-0000-0000-000000000000",
            user_id: "00000000-0000-0000-0000-000000000000",
            technical_questions: [],
            behavioral_questions: [],
          })
          .select()

        if (directError && directError.message.includes("does not exist")) {
          // Create the table directly with raw SQL
          const { data, error: rawError } = await supabase.from("jobs").select("id").limit(1)

          if (rawError) {
            return NextResponse.json({ error: rawError.message }, { status: 500 })
          }

          // Create the table with a simple structure first
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS interview_questions (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              job_id UUID NOT NULL,
              user_id UUID NOT NULL,
              resume_id UUID,
              technical_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
              behavioral_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
          `

          // Execute the query directly
          const { error: createError } = await supabase.rpc("exec_sql", { sql: createTableQuery })

          if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 500 })
          }
        }
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Interview questions table created successfully" })
  } catch (error) {
    console.error("Error in create-interview-questions-table route:", error)
    return NextResponse.json(
      {
        error: `Failed to create interview questions table: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
