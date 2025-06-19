import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    // Create the blogs table with a simple SQL query
    const { error } = await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS blogs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          excerpt TEXT,
          content TEXT NOT NULL,
          featured_image_url TEXT,
          author_name VARCHAR(255),
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
          tags TEXT[],
          meta_title VARCHAR(255),
          meta_description TEXT,
          published_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
        CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at);
        CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
      `,
    })

    if (error) {
      // If exec_sql doesn't exist, try direct table creation
      const { error: directError } = await supabase.from("blogs").select("id").limit(1)

      if (directError && directError.code === "42P01") {
        return NextResponse.json(
          {
            error: "Please create the blogs table manually in your Supabase dashboard",
            sql: `
CREATE TABLE blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[],
  meta_title VARCHAR(255),
  meta_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_published_at ON blogs(published_at);
CREATE INDEX idx_blogs_slug ON blogs(slug);
            `,
          },
          { status: 400 },
        )
      }
    }

    return NextResponse.json({ success: true, message: "Blogs table created successfully" })
  } catch (error) {
    console.error("Error setting up blogs table:", error)
    return NextResponse.json({ error: "Failed to setup blogs table" }, { status: 500 })
  }
}
