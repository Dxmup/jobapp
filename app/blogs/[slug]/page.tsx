import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react"

interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image_url?: string
  author_name?: string
  published_at: string
  tags?: string[]
  meta_title?: string
  meta_description?: string
}

async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blogs/${slug}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.blog
  } catch (error) {
    console.error("Error fetching blog:", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlog(params.slug)

  if (!blog) {
    return {
      title: "Blog Not Found | CareerAI",
    }
  }

  return {
    title: blog.meta_title || blog.title,
    description: blog.meta_description || blog.excerpt || "Career advice and insights from CareerAI",
    keywords: blog.tags?.join(", "),
    openGraph: {
      title: blog.title,
      description: blog.excerpt || "Career advice and insights from CareerAI",
      images: blog.featured_image_url ? [blog.featured_image_url] : [],
    },
  }
}

export default async function BlogPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug)

  if (!blog) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b">
        <div className="container mx-auto px-4 py-8">
          <Link href="/blogs">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{blog.title}</h1>

            <div className="flex items-center gap-6 text-gray-600 mb-8">
              {blog.author_name && (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{blog.author_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(blog.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.featured_image_url && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <img
              src={blog.featured_image_url || "/placeholder.svg"}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            {blog.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share this article</h3>
                <p className="text-gray-600">Help others discover valuable career insights</p>
              </div>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
