-- Create prompts table for managing AI prompt templates
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL, -- e.g., 'resume_optimization', 'cover_letter', 'interview_questions'
  content TEXT NOT NULL, -- The prompt template with variables like {{variable_name}}
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable definitions
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata like tags, categories, etc.
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES prompts(id), -- For versioning/cloning
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_prompts_created_by ON prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_prompts_parent_id ON prompts(parent_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_prompts_updated_at();

-- Insert example prompts
INSERT INTO prompts (name, description, type, content, variables, metadata) VALUES
(
  'Resume Optimization',
  'Optimizes resume content based on job description',
  'resume_optimization',
  'Please optimize the following resume for this job posting:

Job Description:
{{job_description}}

Current Resume:
{{resume_content}}

{{#if specific_requirements}}
Pay special attention to these requirements:
{{specific_requirements}}
{{/if}}

Please provide an optimized version that:
1. Highlights relevant skills and experience
2. Uses keywords from the job description
3. Maintains professional formatting
4. Emphasizes achievements with quantifiable results',
  '[
    {
      "name": "job_description",
      "type": "text",
      "required": true,
      "description": "The job posting description"
    },
    {
      "name": "resume_content",
      "type": "text",
      "required": true,
      "description": "Current resume content"
    },
    {
      "name": "specific_requirements",
      "type": "text",
      "required": false,
      "description": "Specific requirements to focus on"
    }
  ]',
  '{"category": "resume", "tags": ["optimization", "job-matching"], "estimated_tokens": 500}'
),
(
  'Cover Letter Generation',
  'Generates personalized cover letters based on resume and job description',
  'cover_letter',
  'Create a compelling cover letter for the following job application:

Job Title: {{job_title}}
Company: {{company_name}}

Job Description:
{{job_description}}

Applicant Resume Summary:
{{resume_summary}}

{{#if company_research}}
Company Information:
{{company_research}}
{{/if}}

Please write a professional cover letter that:
1. Shows enthusiasm for the specific role and company
2. Highlights relevant experience from the resume
3. Demonstrates knowledge of the company
4. Maintains a professional yet personable tone
5. Includes a strong call to action',
  '[
    {
      "name": "job_title",
      "type": "string",
      "required": true,
      "description": "The job title being applied for"
    },
    {
      "name": "company_name",
      "type": "string",
      "required": true,
      "description": "Name of the company"
    },
    {
      "name": "job_description",
      "type": "text",
      "required": true,
      "description": "The job posting description"
    },
    {
      "name": "resume_summary",
      "type": "text",
      "required": true,
      "description": "Summary of applicant experience and skills"
    },
    {
      "name": "company_research",
      "type": "text",
      "required": false,
      "description": "Additional company information or research"
    }
  ]',
  '{"category": "cover_letter", "tags": ["personalization", "job-application"], "estimated_tokens": 400}'
),
(
  'Interview Questions Generator',
  'Generates potential interview questions based on job description and role level',
  'interview_questions',
  'Generate comprehensive interview questions for the following position:

Job Title: {{job_title}}
Company: {{company_name}}
Experience Level: {{experience_level}}

Job Description:
{{job_description}}

{{#if focus_areas}}
Focus Areas:
{{focus_areas}}
{{/if}}

Please provide:
1. 5-7 general questions about the role and company fit
2. 5-7 technical/skill-based questions specific to the job requirements
3. 3-5 behavioral questions using the STAR method
4. 2-3 questions the candidate should ask the interviewer

Format each section clearly and provide brief guidance on what makes a strong answer.',
  '[
    {
      "name": "job_title",
      "type": "string",
      "required": true,
      "description": "The job title"
    },
    {
      "name": "company_name",
      "type": "string",
      "required": true,
      "description": "Name of the company"
    },
    {
      "name": "experience_level",
      "type": "select",
      "required": true,
      "options": ["Entry Level", "Mid Level", "Senior Level", "Executive"],
      "description": "Experience level for the position"
    },
    {
      "name": "job_description",
      "type": "text",
      "required": true,
      "description": "The job posting description"
    },
    {
      "name": "focus_areas",
      "type": "text",
      "required": false,
      "description": "Specific skills or areas to focus on"
    }
  ]',
  '{"category": "interview", "tags": ["preparation", "questions"], "estimated_tokens": 600}'
);
