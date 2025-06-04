import { createServerSupabaseClient } from "./server"

export async function initializeDatabase() {
  const supabase = createServerSupabaseClient()

  console.log("Initializing database...")

  // Create tables
  await supabase.query(`
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create users table if it doesn't exist
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      auth_id UUID UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE,
      has_baseline_resume BOOLEAN DEFAULT FALSE
    );
    
    -- Create jobs table if it doesn't exist
    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      description TEXT,
      status TEXT DEFAULT 'saved',
      url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      applied_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Create resumes table if it doesn't exist
    CREATE TABLE IF NOT EXISTS resumes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT,
      content TEXT NOT NULL,
      is_ai_generated BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE,
      job_title TEXT,
      company TEXT,
      job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
      parent_resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
      version_name TEXT,
      is_base BOOLEAN DEFAULT TRUE
    );
    
    -- Create job_resumes junction table if it doesn't exist
    CREATE TABLE IF NOT EXISTS job_resumes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(job_id, resume_id)
    );
    
    -- Create cover_letters table if it doesn't exist
    CREATE TABLE IF NOT EXISTS cover_letters (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      is_ai_generated BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create job_events table if it doesn't exist
    CREATE TABLE IF NOT EXISTS job_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add new columns to resumes table if they don't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'job_id') THEN
        ALTER TABLE resumes ADD COLUMN job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'parent_resume_id') THEN
        ALTER TABLE resumes ADD COLUMN parent_resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'version_name') THEN
        ALTER TABLE resumes ADD COLUMN version_name TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'is_base') THEN
        ALTER TABLE resumes ADD COLUMN is_base BOOLEAN DEFAULT TRUE;
      END IF;
    END $$;
  `)

  console.log("Database initialization complete")
}
