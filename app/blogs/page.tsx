import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Career Tips & Insights | CareerAI Blog",
  description:
    "Expert career advice, resume tips, interview strategies, and job search insights to accelerate your career growth.",
  keywords: "career advice, resume tips, interview preparation, job search, career development",
}

interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image_url?: string
  author_name?: string
  published_at: string
  tags?: string[]
}

async function getBlogs(): Promise<Blog[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blogs?limit=20`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error("Failed to fetch blogs")
    }

    const data = await response.json()
    return data.blogs || []
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return []
  }
}

export default async function BlogsPage() {
  const blogs = await getBlogs()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Career Insights & Tips
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Expert advice and actionable insights to help you land your dream job, advance your career, and navigate
              the modern job market with confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 py-16">
        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We're working on creating valuable content to help you succeed in your career. Check back soon for expert
              tips and insights!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  {blog.featured_image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={blog.featured_image_url || "/placeholder.svg"}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      {blog.author_name && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{blog.author_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-blue-600 transition-colors">{blog.title}</CardTitle>
                    {blog.excerpt && <CardDescription className="line-clamp-3">{blog.excerpt}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {blog.tags && blog.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{blog.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
