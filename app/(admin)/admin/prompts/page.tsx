"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Plus, Edit, History, Play, Trash2, Copy } from "lucide-react"

interface Prompt {
  id: string
  name: string
  category: string
  description: string | null
  content: string
  variables: string[]
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const PROMPT_CATEGORIES = ["interview", "resume", "cover-letter", "general", "system"]

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false)
  const [selectedPromptVersions, setSelectedPromptVersions] = useState<Prompt[]>([])

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
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      if (showInactive) {
        params.append("includeInactive", "true")
      }

      const response = await fetch(`/api/admin/prompts?${params}`)
      if (!response.ok) throw new Error("Failed to fetch prompts")

      const data = await response.json()
      setPrompts(data.prompts || [])
    } catch (error) {
      console.error("Error fetching prompts:", error)
      toast.error("Failed to fetch prompts")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrompt = async () => {
    try {
      const response = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create prompt")

      toast.success("Prompt created successfully")
      setIsCreateDialogOpen(false)
      resetForm()
      fetchPrompts()
    } catch (error) {
      console.error("Error creating prompt:", error)
      toast.error("Failed to create prompt")
    }
  }

  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return

    try {
      const response = await fetch(`/api/admin/prompts/${editingPrompt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description,
          content: formData.content,
          variables: formData.variables,
          is_active: editingPrompt.is_active,
        }),
      })

      if (!response.ok) throw new Error("Failed to update prompt")

      toast.success("Prompt updated successfully")
      setIsEditDialogOpen(false)
      setEditingPrompt(null)
      resetForm()
      fetchPrompts()
    } catch (error) {
      console.error("Error updating prompt:", error)
      toast.error("Failed to update prompt")
    }
  }

  const handleActivatePrompt = async (promptId: string) => {
    try {
      const response = await fetch(`/api/admin/prompts/${promptId}/activate`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to activate prompt")

      toast.success("Prompt activated successfully")
      fetchPrompts()
    } catch (error) {
      console.error("Error activating prompt:", error)
      toast.error("Failed to activate prompt")
    }
  }

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return

    try {
      const response = await fetch(`/api/admin/prompts/${promptId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete prompt")

      toast.success("Prompt deleted successfully")
      fetchPrompts()
    } catch (error) {
      console.error("Error deleting prompt:", error)
      toast.error("Failed to delete prompt")
    }
  }

  const showVersionHistory = async (promptName: string) => {
    try {
      const response = await fetch(`/api/admin/prompts?name=${promptName}&includeInactive=true`)
      if (!response.ok) throw new Error("Failed to fetch prompt versions")

      const data = await response.json()
      setSelectedPromptVersions(data.prompts || [])
      setIsVersionDialogOpen(true)
    } catch (error) {
      console.error("Error fetching prompt versions:", error)
      toast.error("Failed to fetch prompt versions")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      content: "",
      variables: [],
    })
  }

  const openEditDialog = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setFormData({
      name: prompt.name,
      category: prompt.category,
      description: prompt.description || "",
      content: prompt.content,
      variables: prompt.variables || [],
    })
    setIsEditDialogOpen(true)
  }

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g)
    return matches ? [...new Set(matches.map((match) => match.slice(1, -1)))] : []
  }

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
      variables: extractVariables(content),
    }))
  }

  const groupedPrompts = prompts.reduce(
    (acc, prompt) => {
      if (!acc[prompt.category]) {
        acc[prompt.category] = []
      }
      acc[prompt.category].push(prompt)
      return acc
    },
    {} as Record<string, Prompt[]>,
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prompts Management</h1>
          <p className="text-gray-600">Manage system prompts with versioning and variables</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
              <DialogDescription>Create a new system prompt with variables and versioning support</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., interview-introduction"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_CATEGORIES.map((category) => (
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this prompt's purpose"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Enter prompt content with variables like {userFirstName}, {companyName}, etc."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              {formData.variables.length > 0 && (
                <div>
                  <Label>Detected Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.variables.map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePrompt}>Create Prompt</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PROMPT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
          <Label htmlFor="show-inactive">Show inactive versions</Label>
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          {Object.entries(groupedPrompts).map(([category, categoryPrompts]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPrompts.map((prompt) => (
                  <Card key={prompt.id} className={`${!prompt.is_active ? "opacity-60" : ""}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{prompt.name}</CardTitle>
                          <CardDescription>{prompt.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={prompt.is_active ? "default" : "secondary"}>v{prompt.version}</Badge>
                          {prompt.is_active && (
                            <Badge variant="outline" className="text-green-600">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 line-clamp-3">{prompt.content.substring(0, 150)}...</p>
                        </div>
                        {prompt.variables && prompt.variables.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Variables:</p>
                            <div className="flex flex-wrap gap-1">
                              {prompt.variables.slice(0, 3).map((variable) => (
                                <Badge key={variable} variant="outline" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                              {prompt.variables.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{prompt.variables.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(prompt)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => showVersionHistory(prompt.name)}>
                              <History className="h-3 w-3" />
                            </Button>
                            {!prompt.is_active && (
                              <Button size="sm" variant="outline" onClick={() => handleActivatePrompt(prompt.id)}>
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                            onClick={() => handleDeletePrompt(prompt.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-left p-4">Version</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Variables</th>
                      <th className="text-left p-4">Updated</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prompts.map((prompt) => (
                      <tr key={prompt.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{prompt.name}</p>
                            <p className="text-sm text-gray-600">{prompt.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{prompt.category}</Badge>
                        </td>
                        <td className="p-4">v{prompt.version}</td>
                        <td className="p-4">
                          <Badge variant={prompt.is_active ? "default" : "secondary"}>
                            {prompt.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {prompt.variables?.slice(0, 2).map((variable) => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                            {prompt.variables && prompt.variables.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{prompt.variables.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(prompt.updated_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(prompt)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => showVersionHistory(prompt.name)}>
                              <History className="h-3 w-3" />
                            </Button>
                            {!prompt.is_active && (
                              <Button size="sm" variant="outline" onClick={() => handleActivatePrompt(prompt.id)}>
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleDeletePrompt(prompt.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>Editing will create a new version of this prompt</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} disabled />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={formData.category} disabled />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            {formData.variables.length > 0 && (
              <div>
                <Label>Detected Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePrompt}>Update Prompt</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>View and manage different versions of this prompt</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPromptVersions.map((prompt) => (
              <Card key={prompt.id} className={`${!prompt.is_active ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Version {prompt.version}</CardTitle>
                      <CardDescription>
                        {prompt.description} • {new Date(prompt.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {prompt.is_active && (
                        <Badge variant="outline" className="text-green-600">
                          Active
                        </Badge>
                      )}
                      <div className="flex space-x-1">
                        {!prompt.is_active && (
                          <Button size="sm" variant="outline" onClick={() => handleActivatePrompt(prompt.id)}>
                            <Play className="h-3 w-3 mr-1" />
                            Activate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(prompt.content)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                      {prompt.content}
                    </pre>
                    {prompt.variables && prompt.variables.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Variables:</p>
                        <div className="flex flex-wrap gap-1">
                          {prompt.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
