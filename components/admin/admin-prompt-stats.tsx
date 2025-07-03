"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Activity, CheckCircle, AlertCircle } from "lucide-react"
import type { PromptTemplate } from "@/lib/prompt-template-engine"

interface AdminPromptStatsProps {
  prompts: PromptTemplate[]
  types: Array<{ type: string; count: number }>
}

export function AdminPromptStats({ prompts, types }: AdminPromptStatsProps) {
  const totalPrompts = prompts.length
  const activePrompts = prompts.filter((p) => p.is_active).length
  const totalUsage = prompts.reduce((sum, p) => sum + p.usage_count, 0)
  const avgUsage = totalPrompts > 0 ? Math.round(totalUsage / totalPrompts) : 0

  const mostUsedPrompt = prompts.reduce(
    (max, p) => (p.usage_count > max.usage_count ? p : max),
    prompts[0] || { name: "None", usage_count: 0 },
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPrompts}</div>
          <p className="text-xs text-muted-foreground">
            {activePrompts} active, {totalPrompts - activePrompts} inactive
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{avgUsage} average per prompt</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalPrompts > 0 ? Math.round((activePrompts / totalPrompts) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {activePrompts} of {totalPrompts} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Used</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostUsedPrompt.usage_count}</div>
          <p className="text-xs text-muted-foreground truncate">{mostUsedPrompt.name}</p>
        </CardContent>
      </Card>
    </div>
  )
}
