"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye, Plus, Trash, AlertCircle } from "lucide-react"
import type { PromptTemplate, PromptVariable } from "@/lib/prompt-template-engine"
import { PromptTemplateEngine } from "@/lib/prompt-template-engine"

interface AdminPromptEditorProps {
  prompt: PromptTemplate | null
  onClose: () => void
  onSave: () => void
}

export function AdminPromptEditor({ prompt, onClose, onSave }: AdminPromptEditorProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    content: "",
    is_active: true,
    metadata: {} as Record<string, any>,
  })
  const [variables, setVariables] = useState<PromptVariable[]>([])
  const [preview, setPreview] = useState("")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const promptTypes = [
    { value: "resume_optimization", label: "Resume Optimization" },
    { value: "cover_letter", label: "Cover Letter" },
    { value: "interview_questions", label: "Interview Questions" },
    { value: "job_analysis", label: "Job Analysis" },
    { value: "custom", label: "Custom" },
  ]

  useEffect(() => {
    if (prompt) {
      setFormData({
        name: prompt.name,
        description: prompt.description || "",
        type: prompt.type,
        content: prompt.content,
        is_active: prompt.is_active,
        metadata: prompt.metadata || {},
      })
      setVariables(prompt.variables || [])
    }
  }, [prompt])

  useEffect(() => {
    updatePreview()
  }, [formData.content, variables])

  const updatePreview = () => {
    try {
      const previewText = PromptTemplateEngine.getPreview(formData.content, variables)
      setPreview(previewText)
      setErrors([])
    } catch (error) {
      setPreview(`Preview Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      setErrors([error instanceof Error ? error.message : "Unknown error"])
    }
  }

  const handleAddVariable = () => {
    const newVariable: PromptVariable = {
      name: "",
      type: "string",
      required: false,
      description: "",
    }
    setVariables([...variables, newVariable])
  }

  const handleUpdateVariable = (index: number, updates: Partial<PromptVariable>) => {
    const updated = [...variables]
    updated[index] = { ...updated[index], ...updates }
    setVariables(updated)
  }

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index))
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.name.trim()) errors.push("Name is required")
    if (!formData.type.trim()) errors.push("Type is required")
    if (!formData.content.trim()) errors.push("Content is required")

    // Validate variables
    variables.forEach((variable, index) => {
      if (!variable.name.trim()) {
        errors.push(`Variable ${index + 1}: Name is required`)
      }
      if (variable.type === "select" && (!variable.options || variable.options.length === 0)) {
        errors.push(`Variable ${index + 1}: Select type requires options`)
      }
    })

    // Check for duplicate variable names
    const variableNames = variables.map((v) => v.name.trim()).filter(Boolean)
    const duplicates = variableNames.filter((name, index) => variableNames.indexOf(name) !== index)
    if (duplicates.length > 0) {
      errors.push(`Duplicate variable names: ${duplicates.join(", ")}`)
    }

    return errors
  }

  const handleSave = async () => {
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    setErrors([])

    try {
      const payload = {
        ...formData,
        variables,
      }

      const url = prompt ? `/api/prompts/${prompt.id}` : "/api/prompts"
      const method = prompt ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSave()
      } else {
        const result = await response.json()
        setErrors([result.error || "Failed to save prompt"])
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Failed to save prompt"])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{prompt ? "Edit Prompt" : "Create Prompt"}</h1>
            <p className="text-gray-600">{prompt ? `Editing: ${prompt.name}` : "Create a new prompt template"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={updatePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium text-red-800">Please fix the following errors:</div>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter prompt name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this prompt does"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select prompt type" />
                  </SelectTrigger>
                  <SelectContent>
                    {promptTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prompt Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter your prompt template with variables like {{variable_name}}"
                  rows={12}
                  className="font-mono text-sm"
                />
                <div className="text-xs text-gray-500 mt-2">
                  Use <code>{"{{variable_name}}"}</code> for variables and <code>{"{{#if variable}}...{{/if}}"}</code>{" "}
                  for conditionals
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Variables</CardTitle>
                <Button size="sm" onClick={handleAddVariable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {variables.map((variable, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Variable {index + 1}</Badge>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveVariable(index)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={variable.name}
                              onChange={(e) => handleUpdateVariable(index, { name: e.target.value })}
                              placeholder="variable_name"
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={variable.type}
                              onValueChange={(value: any) => handleUpdateVariable(index, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Input
                            value={variable.description || ""}
                            onChange={(e) => handleUpdateVariable(index, { description: e.target.value })}
                            placeholder="Describe this variable"
                          />
                        </div>

                        {variable.type === "select" && (
                          <div>
                            <Label>Options (comma-separated)</Label>
                            <Input
                              value={variable.options?.join(", ") || ""}
                              onChange={(e) =>
                                handleUpdateVariable(index, {
                                  options: e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={variable.required}
                            onCheckedChange={(checked) => handleUpdateVariable(index, { required: checked })}
                          />
                          <Label>Required</Label>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {variables.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-sm">No variables defined</div>
                      <div className="text-xs">Add variables to make your prompt dynamic</div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded border">
                  {preview || "Enter content to see preview..."}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Variables:</span>
                <span className="font-medium">{variables.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Required:</span>
                <span className="font-medium">{variables.filter((v) => v.required).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Tokens:</span>
                <span className="font-medium">{PromptTemplateEngine.estimateTokens(preview)}</span>
              </div>
              <Separator />
              <div className="text-xs text-gray-500">
                Variables found in template:{" "}
                {PromptTemplateEngine.extractVariables(formData.content).join(", ") || "None"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
