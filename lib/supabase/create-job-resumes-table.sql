-- Create job_resumes table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure unique combinations per user
  UNIQUE(job_id, resume_id, user_id)
);

-- Enable RLS
ALTER TABLE job_resumes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own job_resume associations"
  ON job_resumes FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_resumes_job_id ON job_resumes(job_id);
CREATE INDEX IF NOT EXISTS idx_job_resumes_resume_id ON job_resumes(resume_id);
CREATE INDEX IF NOT EXISTS idx_job_resumes_user_id ON job_resumes(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_resumes_updated_at 
  BEFORE UPDATE ON job_resumes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
