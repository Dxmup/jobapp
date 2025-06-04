-- Create a function to create the job_resumes table
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
  END IF;
END;
$$ LANGUAGE plpgsql;
