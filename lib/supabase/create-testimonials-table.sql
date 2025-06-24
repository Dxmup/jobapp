-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  position TEXT,
  company TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active testimonials ordered by display_order
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order ON testimonials (is_active, display_order);

-- Insert existing testimonials
INSERT INTO testimonials (quote, author, position, company, is_active, display_order) VALUES
(
  'JobCraft AI transformed my job search. I landed interviews at 3 top companies within a week of using their AI-optimized resume and cover letters.',
  'Sofia Chen',
  'Software Engineer',
  NULL,
  true,
  1
),
(
  'After 2 months of job searching with no luck, JobCraft AI helped me tailor my resume perfectly. I got 5 callbacks in just one week!',
  'Marcus Johnson',
  'Marketing Director',
  NULL,
  true,
  2
),
(
  'The timeline feature helped me stay organized during my job hunt. I never missed a follow-up and landed my dream role at a Fortune 500 company.',
  'Priya Patel',
  'Product Manager',
  NULL,
  true,
  3
),
(
  'The AI-generated cover letters saved me hours of work and were better than anything I could write myself. Worth every penny!',
  'James Wilson',
  'Data Scientist',
  NULL,
  true,
  4
),
(
  'As a career changer, I was struggling to highlight my transferable skills. JobCraft AI helped me reframe my experience and I got hired within a month.',
  'Olivia Martinez',
  'UX Designer',
  NULL,
  true,
  5
);
