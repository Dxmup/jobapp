"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminPromptList } from "@/components/admin/admin-prompt-list"
import { AdminPromptEditor } from "@/components/admin/admin-prompt-editor"
import { AdminPromptStats } from "@/components/admin/admin-prompt-stats"
import { Plus, Search, Filter } from "lucide-react"
import type { PromptTemplate } from "@/lib/prompt-template-engine"

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [showEditor, setShowEditor] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null)
  const [promptTypes, setPromptTypes] = useState<Array<{ type: string; count: number }>>([])

  useEffect(() => {
    fetchPrompts()
    fetchPromptTypes()
  }, [searchQuery, selectedType])

  const fetchPrompts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedType !== "all") params.append("type", selectedType)

      const response = await fetch(`/api/prompts?${params}`)
      const result = await response.json()

      if (response.ok) {
        setPrompts(result.data)
      } else {
        console.error("Failed to fetch prompts:", result.error)
      }
    } catch (error) {
      console.error("Error fetching prompts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPromptTypes = async () => {
    try {
      const response = await fetch("/api/prompts/types")
      if (response.ok) {
        const types = await response.json()
        setPromptTypes(types)
      }
    } catch (error) {
      console.error("Error fetching prompt types:", error)
    }
  }

  const handleCreatePrompt = () => {
    setEditingPrompt(null)
    setShowEditor(true)
  }

  const handleEditPrompt = (prompt: PromptTemplate) => {
    setEditingPrompt(prompt)
    setShowEditor(true)
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingPrompt(null)
    fetchPrompts()
  }

  const handleDeletePrompt = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchPrompts()
      } else {
        const result = await response.json()
        alert(`Failed to delete prompt: ${result.error}`)
      }
    } catch (error) {
      console.error("Error deleting prompt:", error)
      alert("Failed to delete prompt")
    }
  }

  const handleClonePrompt = async (prompt: PromptTemplate) => {
    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...prompt,
          name: `${prompt.name} (Copy)`,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
        }),
      })

      if (response.ok) {
        fetchPrompts()
      } else {
        const result = await response.json()
        alert(`Failed to clone prompt: ${result.error}`)
      }
    } catch (error) {
      console.error("Error cloning prompt:", error)
      alert("Failed to clone prompt")
    }
  }

  if (showEditor) {
    return <AdminPromptEditor prompt={editingPrompt} onClose={handleCloseEditor} onSave={handleCloseEditor} />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Prompt Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage AI prompt templates and variables</p>
        </div>
        <Button onClick={handleCreatePrompt} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Prompt
        </Button>
      </div>

      {/* Stats Overview */}
      <AdminPromptStats prompts={prompts} types={promptTypes} />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                {promptTypes.map((type) => (
                  <option key={type.type} value={type.type}>
                    {type.type} ({type.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="list">Prompt List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <AdminPromptList
            prompts={prompts}
            loading={loading}
            onEdit={handleEditPrompt}
            onDelete={handleDeletePrompt}
            onClone={handleClonePrompt}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prompts
                    .sort((a, b) => b.usage_count - a.usage_count)
                    .slice(0, 5)
                    .map((prompt) => (
                      <div key={prompt.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{prompt.name}</div>
                          <div className="text-sm text-gray-500">{prompt.type}</div>
                        </div>
                        <Badge variant="secondary">{prompt.usage_count} uses</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promptTypes.map((type) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="font-medium capitalize">{type.type.replace(/_/g, " ")}</div>
                      <Badge variant="outline">{type.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
