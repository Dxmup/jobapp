"use client"

import { CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResumeChangesListProps {
  changes: Array<{
    original: string
    improved: string
    type: "language" | "impact" | "action" | "format"
  }>
}

export function ResumeChangesList({ changes }: ResumeChangesListProps) {
  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case "language":
        return "Language Enhancement"
      case "impact":
        return "Impact Improvement"
      case "action":
        return "Action Verb Upgrade"
      case "format":
        return "Format Optimization"
      default:
        return "Professional Enhancement"
    }
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case "language":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "impact":
        return "text-green-600 bg-green-50 border-green-200"
      case "action":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "format":
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            AI Improvements Made
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {changes.map((change, index) => (
            <div key={index} className="space-y-3">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getChangeTypeColor(change.type)}`}
              >
                {getChangeTypeLabel(change.type)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-red-600">Before:</div>
                  <div className="text-sm text-gray-700 bg-red-50 p-3 rounded border-l-4 border-red-400">
                    "{change.original}"
                  </div>
                </div>

                {/* After */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-green-600">After:</div>
                  <div className="text-sm text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-400">
                    "{change.improved}"
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pro Tip */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          <strong>💡 Pro Tip:</strong> These improvements make your resume more action-oriented and impactful. Sign up
          to get unlimited optimizations and even more powerful AI enhancements!
        </div>
      </div>
    </div>
  )
}
