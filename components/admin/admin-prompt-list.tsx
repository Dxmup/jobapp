"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, MoreHorizontal, Trash, Copy, Play } from "lucide-react"
import type { PromptTemplate } from "@/lib/prompt-template-engine"

interface AdminPromptListProps {
  prompts: PromptTemplate[]
  loading: boolean
  onEdit: (prompt: PromptTemplate) => void
  onDelete: (id: string) => void
  onClone: (prompt: PromptTemplate) => void
}

export function AdminPromptList({ prompts, loading, onEdit, onDelete, onClone }: AdminPromptListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      resume_optimization: "bg-blue-100 text-blue-800",
      cover_letter: "bg-green-100 text-green-800",
      interview_questions: "bg-purple-100 text-purple-800",
      job_analysis: "bg-orange-100 text-orange-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (prompts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <div className="text-lg font-medium mb-2">No prompts found</div>
            <div className="text-sm">Create your first prompt template to get started.</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prompt</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Variables</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{prompt.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">{prompt.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeColor(prompt.type)}>{prompt.type.replace(/_/g, " ")}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={prompt.is_active ? "default" : "secondary"}>
                    {prompt.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {prompt.variables.length} variable{prompt.variables.length !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {prompt.variables.filter((v) => v.required).length} required
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{prompt.usage_count}</div>
                  <div className="text-xs text-muted-foreground">uses</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{formatDate(prompt.updated_at)}</div>
                  <div className="text-xs text-muted-foreground">v{prompt.version}</div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(prompt)}>
                        <Eye className="mr-2 h-4 w-4" /> View/Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onClone(prompt)}>
                        <Copy className="mr-2 h-4 w-4" /> Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" /> Test
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(prompt.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
