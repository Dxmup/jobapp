"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Plus, Search, Edit, Trash2, Eye, Power, MessageSquare } from "lucide-react"

interface Prompt {
  id: string
  name: string
  category: string
  description?: string
  content: string
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  { value: "interview", label: "Interview" },
  { value: "resume", label: "Resume" },
  { value: "cover-letter", label: "Cover Letter" },
  { value: "general", label: "General" },
]

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    content: "",
  })

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/prompts")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setPrompts(data.prompts || [])
    } catch (error) {
      console.error("Error fetching prompts:", error)
      toast.error(`Failed to fetch prompts: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const extractVariables = (content: string): string[] => {
    const variableRegex = /\{([^}]+)\}/g
    const variables = new Set<string>()
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1])
    }

    return Array.from(variables)
  }

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create prompt")
      }

      toast.success("Prompt created successfully")
      setIsCreateDialogOpen(false)
      setFormData({ name: "", category: "", description: "", content: "" })
      fetchPrompts()
    } catch (error) {
      console.error("Error creating prompt:", error)
      toast.error(`Failed to create prompt: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleEdit = async () => {
    if (!selectedPrompt) return

    try {
      const response = await fetch(`/api/admin/prompts/${selectedPrompt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update prompt")
      }

      toast.success("Prompt updated successfully")
      setIsEditDialogOpen(false)
      setSelectedPrompt(null)
      setFormData({ name: "", category: "", description: "", content: "" })
      fetchPrompts()
    } catch (error) {
      console.error("Error updating prompt:", error)
      toast.error(`Failed to update prompt: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleDelete = async (prompt: Prompt) => {
    try {
      const response = await fetch(`/api/admin/prompts/${prompt.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete prompt")
      }

      toast.success("Prompt deleted successfully")
      fetchPrompts()
    } catch (error) {
      console.error("Error deleting prompt:", error)
      toast.error(`Failed to delete prompt: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleActivate = async (prompt: Prompt) => {
    try {
      const response = await fetch(`/api/admin/prompts/${prompt.id}/activate`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to activate prompt")
      }

      toast.success("Prompt activated successfully")
      fetchPrompts()
    } catch (error) {
      console.error("Error activating prompt:", error)
      toast.error(`Failed to activate prompt: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const openEditDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setFormData({
      name: prompt.name,
      category: prompt.category,
      description: prompt.description || "",
      content: prompt.content,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setIsViewDialogOpen(true)
  }

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading prompts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Prompt Management</h1>
          <p className="text-muted-foreground">Manage AI prompts for the application</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
              <DialogDescription>Create a new AI prompt template with variables</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., interview-introduction"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the prompt"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Prompt content with {variables} in curly braces"
                  rows={10}
                />
                {formData.content && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Detected variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {extractVariables(formData.content).map((variable) => (
                        <Badge key={variable} variant="secondary">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name || !formData.category || !formData.content}>
                Create Prompt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prompts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{prompt.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  {prompt.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
              <CardDescription>
                <Badge variant="outline" className="mb-2">
                  {CATEGORIES.find((c) => c.value === prompt.category)?.label || prompt.category}
                </Badge>
                {prompt.description && <p>{prompt.description}</p>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Variables ({prompt.variables.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {prompt.variables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {prompt.variables.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{prompt.variables.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={() => openViewDialog(prompt)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(prompt)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    {!prompt.is_active && (
                      <Button size="sm" variant="outline" onClick={() => handleActivate(prompt)}>
                        <Power className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{prompt.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(prompt)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first prompt"}
          </p>
          {!searchTerm && selectedCategory === "all" && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Prompt
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>Update the prompt template and variables</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
              />
              {formData.content && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Detected variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {extractVariables(formData.content).map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Prompt</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPrompt?.name}</DialogTitle>
            <DialogDescription>
              <Badge variant="outline" className="mr-2">
                {CATEGORIES.find((c) => c.value === selectedPrompt?.category)?.label || selectedPrompt?.category}
              </Badge>
              {selectedPrompt?.is_active ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedPrompt && (
            <div className="space-y-4">
              {selectedPrompt.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedPrompt.description}</p>
                </div>
              )}
              <div>
                <Label>Variables ({selectedPrompt.variables.length})</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedPrompt.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Content</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <pre className="text-sm whitespace-pre-wrap">{selectedPrompt.content}</pre>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Created: {new Date(selectedPrompt.created_at).toLocaleString()}
                {selectedPrompt.updated_at !== selectedPrompt.created_at && (
                  <> • Updated: {new Date(selectedPrompt.updated_at).toLocaleString()}</>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
