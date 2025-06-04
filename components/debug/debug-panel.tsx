"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, ChevronUp, Bug } from "lucide-react"

interface DebugPanelProps {
  title?: string
  data: Record<string, any>
  showInitially?: boolean
}

export function DebugPanel({ title = "Debug Information", data, showInitially = false }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(showInitially)

  return (
    <Card className="my-4 border-amber-500 bg-amber-50 dark:bg-amber-950">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-800 dark:text-amber-300">{title}</CardTitle>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="text-amber-700 dark:text-amber-400">
            Debugging information for developers
          </CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="mb-2">
                <h3 className="font-medium text-amber-800 dark:text-amber-300">{key}</h3>
                <pre className="mt-1 max-h-60 overflow-auto rounded bg-amber-100 p-2 text-xs text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                  {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                </pre>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export function ErrorAlert({ message, details }: { message: string; details?: string }) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertDescription>
        <div className="font-medium">{message}</div>
        {details && (
          <pre className="mt-2 max-h-40 overflow-auto rounded bg-red-50 p-2 text-xs text-red-900 dark:bg-red-950 dark:text-red-100">
            {details}
          </pre>
        )}
      </AlertDescription>
    </Alert>
  )
}
