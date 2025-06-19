"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, Search, Calendar, FileText } from "lucide-react"

interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image_url?: string
  author_name?: string
  status: "draft" | "published" | "archived"
  tags?: string[]
  meta_title?: string
  meta_description?: string
  published_at?: string
  created_at: string
  updated_at: string
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    author_name: "",
    status: "draft" as const,
    tags: "",
    meta_title: "",
    meta_description: "",
  })

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/admin/blogs")
      const data = await response.json()

      if (data.tableExists === false) {
        setTableExists(false)
      } else {
        setBlogs(data.blogs || [])
        setTableExists(true)
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
      setTableExists(false)
    } finally {
      setLoading(false)
    }
  }

  const setupTable = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/blogs/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setTableExists(true)
        await fetchBlogs()
      } else {
        alert(`Setup failed: ${data.error}\n\nSQL to run manually:\n${data.sql}`)
      }
    } catch (error) {
      console.error("Error setting up table:", error)
      alert("Failed to setup table. Please check console for details.")
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const blogData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    try {
      const url = editingBlog ? `/api/admin/blogs/${editingBlog.id}` : "/api/admin/blogs"
      const method = editingBlog ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
      })

      if (response.ok) {
        await fetchBlogs()
        resetForm()
        setIsDialogOpen(false)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving blog:", error)
      alert("Failed to save blog")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return

    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchBlogs()
      } else {
        alert("Failed to delete blog")
      }
    } catch (error) {
      console.error("Error deleting blog:", error)
      alert("Failed to delete blog")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image_url: "",
      author_name: "",
      status: "draft",
      tags: "",
      meta_title: "",
      meta_description: "",
    })
    setEditingBlog(null)
  }

  const openEditDialog = (blog: Blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content,
      featured_image_url: blog.featured_image_url || "",
      author_name: blog.author_name || "",
      status: blog.status,
      tags: blog.tags?.join(", ") || "",
      meta_title: blog.meta_title || "",
      meta_description: blog.meta_description || "",
    })
    setIsDialogOpen(true)
  }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || blog.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Blog Management</h1>
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (!tableExists) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Blog Management</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Setup Required</h3>
              <p className="text-gray-500 mb-4">
                The blogs table needs to be created before you can manage blog posts.
              </p>
              <Button onClick={setupTable} disabled={loading}>
                {loading ? "Setting up..." : "Setup Blogs Table"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-gray-600 mt-2">Create and manage blog content</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              New Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value
                      setFormData((prev) => ({
                        ...prev,
                        title,
                        slug: prev.slug || generateSlug(title),
                        meta_title: prev.meta_title || title,
                      }))
                    }}
                    placeholder="Enter blog title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your blog content here..."
                  rows={10}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author Name</Label>
                  <Input
                    id="author"
                    value={formData.author_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author_name: e.target.value }))}
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "draft" | "published" | "archived") =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="career, resume, interview"
                />
              </div>

              <div>
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="meta_title">Meta Title (SEO)</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO title"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO description (150-160 characters)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingBlog ? "Update" : "Create"} Blog</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blog List */}
      <div className="grid gap-4">
        {filteredBlogs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No blogs found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No blogs match your current filters."
                    : "Get started by creating your first blog post."}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button
                    onClick={() => {
                      resetForm()
                      setIsDialogOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Blog
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredBlogs.map((blog) => (
            <Card key={blog.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{blog.title}</CardTitle>
                      <Badge className={getStatusColor(blog.status)}>
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">/{blog.slug}</p>
                    {blog.excerpt && <p className="text-gray-600 mt-2 line-clamp-2">{blog.excerpt}</p>}
                  </div>
                  {blog.featured_image_url && (
                    <img
                      src={blog.featured_image_url || "/placeholder.svg"}
                      alt={blog.title}
                      className="w-20 h-20 object-cover rounded-lg ml-4"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {blog.author_name && <span>By {blog.author_name}</span>}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    </div>
                    {blog.tags && blog.tags.length > 0 && <span>Tags: {blog.tags.slice(0, 2).join(", ")}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {blog.status === "published" && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/blogs/${blog.slug}`} target="_blank" rel="noreferrer">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(blog)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
