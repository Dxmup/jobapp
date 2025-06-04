-- This SQL will be executed via RPC to create the job_resumes table if it doesn't exist
CREATE OR REPLACE FUNCTION create_job_resumes_table()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'job_resumes'
  ) THEN
    -- Create the table
    CREATE TABLE public.job_resumes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
      resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(job_id, resume_id)
    );
    
    -- Add RLS policies
    ALTER TABLE public.job_resumes ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view their own job_resumes" ON public.job_resumes
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.jobs j
          JOIN public.users u ON j.user_id = u.id
          WHERE j.id = job_id AND u.auth_id = auth.uid()
        )
      );
    
    CREATE POLICY "Users can insert their own job_resumes" ON public.job_resumes
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.jobs j
          JOIN public.users u ON j.user_id = u.id
          WHERE j.id = job_id AND u.auth_id = auth.uid()
        )
      );
    
    CREATE POLICY "Users can delete their own job_resumes" ON public.job_resumes
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.jobs j
          JOIN public.users u ON j.user_id = u.id
          WHERE j.id = job_id AND u.auth_id = auth.uid()
        )
      );
  END IF;
END;
$$ LANGUAGE plpgsql;
