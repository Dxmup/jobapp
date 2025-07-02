CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add an index for faster lookups on email
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email);

-- Optional: Add RLS policies if you want to control access
-- For a public waitlist, you might allow anonymous inserts
-- ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public insert" ON public.waitlist FOR INSERT WITH CHECK (true);
