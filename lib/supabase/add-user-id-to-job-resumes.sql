-- This SQL script adds the user_id column to the job_resumes table if it doesn't exist
-- and backfills the data using the user_id from the jobs table.

-- Check if user_id column exists in job_resumes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'job_resumes'
    AND column_name = 'user_id'
  ) THEN
    -- Add user_id column
    ALTER TABLE job_resumes ADD COLUMN user_id UUID;
    
    -- Create index for better performance
    CREATE INDEX IF NOT EXISTS idx_job_resumes_user_id ON job_resumes(user_id);
  END IF;
END $$;

-- Ensure the user_id column references the users table
ALTER TABLE IF EXISTS public.job_resumes
ALTER COLUMN user_id SET DATA TYPE UUID USING user_id::UUID;

ALTER TABLE IF EXISTS public.job_resumes
ADD CONSTRAINT job_resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Backfill the user_id column using the user_id from the jobs table
UPDATE public.job_resumes
SET user_id = j.user_id
FROM public.jobs j
WHERE job_resumes.job_id = j.id
AND job_resumes.user_id IS NULL;

-- Set up RLS policies
-- Users can view their own job_resumes
CREATE POLICY IF NOT EXISTS "Users can view their own job_resumes" ON public.job_resumes
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.jobs j
        JOIN public.users u ON j.user_id = u.id
        WHERE j.id = job_id AND u.auth_id = auth.uid()
    )
);

-- Users can insert their own job_resumes
CREATE POLICY IF NOT EXISTS "Users can insert their own job_resumes" ON public.job_resumes
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.jobs j
        JOIN public.users u ON j.user_id = u.id
        WHERE j.id = job_id AND u.auth_id = auth.uid()
    )
);

-- Users can delete their own job_resumes
CREATE POLICY IF NOT EXISTS "Users can delete their own job_resumes" ON public.job_resumes
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.jobs j
        JOIN public.users u ON j.user_id = u.id
        WHERE j.id = job_id AND u.auth_id = auth.uid()
    )
);
