"use client"

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
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Eye, Play, Filter, Search } from "lucide-react"

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

const CATEGORIES = [
  { value: "interview", label: "Interview" },
  { value: "resume", label: "Resume" },
  { value: "cover-letter", label: "Cover Letter" },
  { value: "general", label: "General" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
]

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
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

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g)
    return matches ? [...new Set(matches.map((match) => match.slice(1, -1)))] : []
  }

  const handleCreatePrompt = async () => {
    try {
      const variables = extractVariables(formData.content)

      const response = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variables,
        }),
      })

      if (!response.ok) throw new Error("Failed to create prompt")

      toast.success("Prompt created successfully")
      setIsCreateDialogOpen(false)
      setFormData({ name: "", category: "", description: "", content: "" })
      fetchPrompts()
    } catch (error) {
      console.error("Error creating prompt:", error)
      toast.error("Failed to create prompt")
    }
  }

  const handleUpdatePrompt = async () => {
    if (!selectedPrompt) return

    try {
      const variables = extractVariables(formData.content)

      const response = await fetch(`/api/admin/prompts/${selectedPrompt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variables,
        }),
      })

      if (!response.ok) throw new Error("Failed to update prompt")

      toast.success("Prompt updated successfully")
      setIsEditDialogOpen(false)
      setSelectedPrompt(null)
      setFormData({ name: "", category: "", description: "", content: "" })
      fetchPrompts()
    } catch (error) {
      console.error("Error updating prompt:", error)
      toast.error("Failed to update prompt")
    }
  }

  const handleDeletePrompt = async (promptId: string) => {
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

  const filteredPrompts = prompts.filter(
    (prompt) =>
      prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const groupedPrompts = filteredPrompts.reduce(
    (acc, prompt) => {
      if (!acc[prompt.name]) {
        acc[prompt.name] = []
      }
      acc[prompt.name].push(prompt)
      return acc
    },
    {} as Record<string, Prompt[]>,
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Prompts Management</h1>
          <p className="text-muted-foreground">Manage AI prompts with versioning and variables</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
              <DialogDescription>Create a new AI prompt with variables support</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., interview-introduction"
                  />
                </div>
                <div className="space-y-2">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the prompt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Prompt content with {variables} in curly braces"
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Use {"{variableName}"} for dynamic content. Variables will be automatically detected.
                </p>
                {formData.content && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {extractVariables(formData.content).map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePrompt} disabled={!formData.name || !formData.category || !formData.content}>
                Create Prompt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
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
            <div className="flex items-center space-x-2">
              <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
              <Label htmlFor="show-inactive">Show inactive versions</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompts List */}
      {loading ? (
        <div className="text-center py-8">Loading prompts...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPrompts).map(([promptName, versions]) => {
            const activeVersion = versions.find((v) => v.is_active)
            const inactiveVersions = versions.filter((v) => !v.is_active)

            return (
              <Card key={promptName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {promptName}
                        <Badge variant="outline">{activeVersion?.category}</Badge>
                        {activeVersion && <Badge variant="default">v{activeVersion.version}</Badge>}
                      </CardTitle>
                      {activeVersion?.description && <CardDescription>{activeVersion.description}</CardDescription>}
                    </div>
                    <div className="flex gap-2">
                      {activeVersion && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => openViewDialog(activeVersion)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(activeVersion)}>
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
                                <AlertDialogAction
                                  onClick={() => handleDeletePrompt(activeVersion.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
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
                  {activeVersion && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Variables:</h4>
                        <div className="flex flex-wrap gap-1">
                          {activeVersion.variables.length > 0 ? (
                            activeVersion.variables.map((variable) => (
                              <Badge key={variable} variant="secondary">
                                {variable}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No variables</span>
                          )}
                        </div>
                      </div>

                      {inactiveVersions.length > 0 && showInactive && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Previous Versions:</h4>
                          <div className="space-y-2">
                            {inactiveVersions.map((version) => (
                              <div key={version.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">v{version.version}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(version.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openViewDialog(version)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleActivatePrompt(version.id)}>
                                    <Play className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>Editing will create a new version of this prompt</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[200px] font-mono text-sm"
              />
              {formData.content && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {extractVariables(formData.content).map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrompt}>Update Prompt</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPrompt?.name}
              <Badge variant="outline">{selectedPrompt?.category}</Badge>
              <Badge variant="default">v{selectedPrompt?.version}</Badge>
              {selectedPrompt?.is_active && <Badge variant="default">Active</Badge>}
            </DialogTitle>
            {selectedPrompt?.description && <DialogDescription>{selectedPrompt.description}</DialogDescription>}
          </DialogHeader>
          {selectedPrompt && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Variables:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedPrompt.variables.length > 0 ? (
                    selectedPrompt.variables.map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No variables</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Content:</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">{selectedPrompt.content}</pre>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
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
