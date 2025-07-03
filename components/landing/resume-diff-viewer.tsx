"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight } from "lucide-react"

interface ResumeDiffViewerProps {
  originalResume: string
  optimizedResume: string
}

interface DiffResult {
  original: string[]
  optimized: string[]
  changes: Array<{
    lineIndex: number
    original: string
    optimized: string
    type: "modified" | "added" | "removed"
  }>
}

export function ResumeDiffViewer({ originalResume, optimizedResume }: ResumeDiffViewerProps) {
  const diffResult = useMemo(() => {
    const originalLines = originalResume.split("\n")
    const optimizedLines = optimizedResume.split("\n")

    const changes: DiffResult["changes"] = []

    // Simple diff algorithm - compare line by line
    const maxLines = Math.max(originalLines.length, optimizedLines.length)

    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || ""
      const optimizedLine = optimizedLines[i] || ""

      if (originalLine !== optimizedLine) {
        if (originalLine && optimizedLine) {
          changes.push({
            lineIndex: i,
            original: originalLine,
            optimized: optimizedLine,
            type: "modified",
          })
        } else if (optimizedLine && !originalLine) {
          changes.push({
            lineIndex: i,
            original: "",
            optimized: optimizedLine,
            type: "added",
          })
        } else if (originalLine && !optimizedLine) {
          changes.push({
            lineIndex: i,
            original: originalLine,
            optimized: "",
            type: "removed",
          })
        }
      }
    }

    return {
      original: originalLines,
      optimized: optimizedLines,
      changes,
    }
  }, [originalResume, optimizedResume])

  const renderResumeWithHighlights = (lines: string[], isOptimized = false) => {
    return lines.map((line, index) => {
      const change = diffResult.changes.find((c) => c.lineIndex === index)
      const hasChange = !!change

      return (
        <div
          key={index}
          className={`py-1 px-2 rounded transition-colors ${
            hasChange
              ? isOptimized
                ? "bg-green-50 border-l-4 border-green-400 dark:bg-green-900/20 dark:border-green-400"
                : "bg-red-50 border-l-4 border-red-400 dark:bg-red-900/20 dark:border-red-400"
              : ""
          }`}
        >
          <span className={`${hasChange ? "font-medium" : ""}`}>
            {line || "\u00A0"} {/* Non-breaking space for empty lines */}
          </span>
        </div>
      )
    })
  }

  return (
    <div className="space-y-6">
      {/* Summary of changes */}
      <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="text-green-800 dark:text-green-200 font-medium">
          Resume optimized with {diffResult.changes.length} professional improvements
        </span>
      </div>

      {/* Changes preview */}
      {diffResult.changes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              Key Improvements Made
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {diffResult.changes.slice(0, 3).map((change, index) => (
              <div key={index} className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  Change {index + 1}
                </Badge>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-red-600 dark:text-red-400">Before:</div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-400 text-sm">
                      {change.original || "Empty line"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">After:</div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-400 text-sm">
                      {change.optimized || "Empty line"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600 dark:text-red-400">Original Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded">
              {renderResumeWithHighlights(diffResult.original, false)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600 dark:text-green-400">Optimized Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded">
              {renderResumeWithHighlights(diffResult.optimized, true)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
