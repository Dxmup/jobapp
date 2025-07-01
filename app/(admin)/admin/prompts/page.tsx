"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Eye, CheckCircle, Circle, History } from "lucide-react"

interface Prompt {
  id: string
  name: string
  category: string
  description: string
  content: string
  variables: string[]
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const CATEGORIES = ["interview", "resume", "cover-letter", "general", "email", "follow-up"]

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    content: "",
    variables: [] as string[],
  })

  useEffect(() => {
    fetchPrompts()
  }, [selectedCategory, showInactive])

  const fetchPrompts = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      if (showInactive) {
        params.append("includeInactive", "true")
      }

      const response = await fetch(`/api/admin/prompts?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPrompts(data.prompts || [])
      } else {
        toast.error("Failed to fetch prompts")
      }
    } catch (error) {
      console.error("Error fetching prompts:", error)
      toast.error("Failed to fetch prompts")
    } finally {
      setLoading(false)
    }
  }

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g)
    if (!matches) return []
    return [...new Set(matches.map((match) => match.slice(1, -1)))]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || !formData.content) {
      toast.error("Please fill in all required fields")
      return
    }

    const variables = extractVariables(formData.content)

    try {
      const url = editingPrompt ? `/api/admin/prompts/${editingPrompt.id}` : "/api/admin/prompts"
      const method = editingPrompt ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variables,
        }),
      })

      if (response.ok) {
        toast.success(editingPrompt ? "Prompt updated successfully" : "Prompt created successfully")
        setIsDialogOpen(false)
        setEditingPrompt(null)
        setFormData({ name: "", category: "", description: "", content: "", variables: [] })
        fetchPrompts()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to save prompt")
      }
    } catch (error) {
      console.error("Error saving prompt:", error)
      toast.error("Failed to save prompt")
    }
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setFormData({
      name: prompt.name,
      category: prompt.category,
      description: prompt.description || "",
      content: prompt.content,
      variables: prompt.variables || [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (promptId: string) => {
    try {
      const response = await fetch(`/api/admin/prompts/${promptId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Prompt deleted successfully")
        fetchPrompts()
      } else {
        toast.error("Failed to delete prompt")
      }
    } catch (error) {
      console.error("Error deleting prompt:", error)
      toast.error("Failed to delete prompt")
    }
  }

  const handleActivate = async (promptId: string) => {
    try {
      const response = await fetch(`/api/admin/prompts/${promptId}/activate`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Prompt activated successfully")
        fetchPrompts()
      } else {
        toast.error("Failed to activate prompt")
      }
    } catch (error) {
      console.error("Error activating prompt:", error)
      toast.error("Failed to activate prompt")
    }
  }

  const handleView = (prompt: Prompt) => {
    setViewingPrompt(prompt)
    setIsViewDialogOpen(true)
  }

  const groupedPrompts = prompts.reduce(
    (acc, prompt) => {
      if (!acc[prompt.name]) {
        acc[prompt.name] = []
      }
      acc[prompt.name].push(prompt)
      return acc
    },
    {} as Record<string, Prompt[]>,
  )

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading prompts...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prompts Management</h1>
          <p className="text-muted-foreground">Manage AI prompts used throughout the application</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPrompt(null)
                setFormData({ name: "", category: "", description: "", content: "", variables: [] })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPrompt ? "Edit Prompt" : "Create New Prompt"}</DialogTitle>
              <DialogDescription>
                {editingPrompt ? "Update the prompt details" : "Create a new AI prompt for the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., interview-introduction"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this prompt's purpose"
                />
              </div>
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the prompt content. Use {variableName} for variables."
                  className="min-h-[200px]"
                  required
                />
              </div>
              {formData.content && (
                <div>
                  <Label>Detected Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {extractVariables(formData.content).map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingPrompt ? "Update" : "Create"} Prompt</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant={showInactive ? "default" : "outline"} onClick={() => setShowInactive(!showInactive)}>
          <History className="h-4 w-4 mr-2" />
          {showInactive ? "Hide" : "Show"} Inactive
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedPrompts).map(([promptName, versions]) => {
          const activeVersion = versions.find((v) => v.is_active)
          const inactiveVersions = versions.filter((v) => !v.is_active)

          return (
            <Card key={promptName}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {promptName}
                      {activeVersion && <Badge variant="default">Active v{activeVersion.version}</Badge>}
                    </CardTitle>
                    <CardDescription>{activeVersion?.description || "No description"}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {activeVersion && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleView(activeVersion)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(activeVersion)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this prompt? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(activeVersion.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeVersion && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{activeVersion.category}</Badge>
                        {activeVersion.variables && activeVersion.variables.length > 0 && (
                          <div className="flex gap-1">
                            {activeVersion.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {activeVersion.content.substring(0, 200)}...
                      </p>
                    </div>
                  )}

                  {showInactive && inactiveVersions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Previous Versions</h4>
                      <div className="space-y-2">
                        {inactiveVersions.map((version) => (
                          <div key={version.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Circle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Version {version.version}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(version.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleView(version)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleActivate(version.id)}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* View Prompt Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewingPrompt?.name} (v{viewingPrompt?.version})
              {viewingPrompt?.is_active && <Badge className="ml-2">Active</Badge>}
            </DialogTitle>
            <DialogDescription>{viewingPrompt?.description}</DialogDescription>
          </DialogHeader>
          {viewingPrompt && (
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Badge variant="outline" className="ml-2">
                  {viewingPrompt.category}
                </Badge>
              </div>
              {viewingPrompt.variables && viewingPrompt.variables.length > 0 && (
                <div>
                  <Label>Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewingPrompt.variables.map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>Content</Label>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">{viewingPrompt.content}</pre>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Created: {new Date(viewingPrompt.created_at).toLocaleString()} | Updated:{" "}
                {new Date(viewingPrompt.updated_at).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
