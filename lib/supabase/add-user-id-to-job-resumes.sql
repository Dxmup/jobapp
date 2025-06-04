-- This SQL script adds the user_id column to the job_resumes table if it doesn't exist
-- and backfills the data using the user_id from the jobs table.

-- Add the user_id column if it doesn't exist
ALTER TABLE IF EXISTS public.job_resumes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

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
