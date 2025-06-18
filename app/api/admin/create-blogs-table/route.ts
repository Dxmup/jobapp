import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const createBlogsTableSQL = `
      -- Create blogs table
      CREATE TABLE IF NOT EXISTS blogs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        featured_image_url TEXT,
        author_id UUID REFERENCES auth.users(id),
        author_name VARCHAR(255),
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        tags TEXT[],
        meta_title VARCHAR(255),
        meta_description TEXT,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
      CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at);
      CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
      CREATE INDEX IF NOT EXISTS idx_blogs_tags ON blogs USING GIN(tags);

      -- Create updated_at trigger
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- Enable RLS
      ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DROP POLICY IF EXISTS "Anyone can view published blogs" ON blogs;
      CREATE POLICY "Anyone can view published blogs" ON blogs
          FOR SELECT USING (status = 'published');

      DROP POLICY IF EXISTS "Admins can manage all blogs" ON blogs;
      CREATE POLICY "Admins can manage all blogs" ON blogs
          FOR ALL USING (
              EXISTS (
                  SELECT 1 FROM user_roles ur
                  JOIN roles r ON ur.role_id = r.id
                  WHERE ur.user_id = auth.uid()
                  AND r.name IN ('admin', 'super_admin')
              )
          );
    `

    const { error } = await supabase.rpc("exec_sql", { sql_query: createBlogsTableSQL })

    if (error) {
      console.error("Error creating blogs table:", error)
      return NextResponse.json({ error: "Failed to create blogs table", details: error }, { status: 500 })
    }

    return NextResponse.json({ message: "Blogs table created successfully" })
  } catch (error) {
    console.error("Error in create-blogs-table:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
