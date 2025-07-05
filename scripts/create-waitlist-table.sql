-- Create waitlist table to store email signups
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'unknown',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Add RLS (Row Level Security) if needed
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for public signups)
CREATE POLICY "Allow public waitlist signups" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Create policy to allow admin reads
CREATE POLICY "Allow admin waitlist reads" ON waitlist
  FOR SELECT USING (true);
