-- Create prompts table for managing all system prompts
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_name ON prompts(name);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_prompts_version ON prompts(name, version);

-- Create unique constraint for active prompts (only one active version per name)
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_active_unique 
ON prompts(name) WHERE is_active = true;

-- Add RLS policies
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage prompts
CREATE POLICY "Admins can manage prompts" ON prompts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'super_admin')
  )
);

-- Allow authenticated users to read active prompts
CREATE POLICY "Users can read active prompts" ON prompts
FOR SELECT USING (is_active = true);
