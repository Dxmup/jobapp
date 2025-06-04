-- Create interview_questions table if it doesn't exist
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interview_questions_job_id ON public.interview_questions(job_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_user_id ON public.interview_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_resume_id ON public.interview_questions(resume_id);

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
