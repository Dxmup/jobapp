"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function StandaloneTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async (testName: string, endpoint: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(endpoint, { method: "POST" })
      const result = await response.json()

      setTestResults((prev) => [
        ...prev,
        {
          test: testName,
          success: response.ok,
          result: result,
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          test: testName,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Standalone Live API Tests</h1>
        <p className="text-muted-foreground mt-2">Test Gemini Live API functionality without any job dependencies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={() => runTest("Official SDK Test", "/api/interview/test-official-sdk")} disabled={isLoading}>
          Test Official SDK
        </Button>

        <Button
          onClick={() => runTest("Compliance Test", "/api/interview/test-live-api-compliance")}
          disabled={isLoading}
        >
          Test API Compliance
        </Button>

        <Button onClick={() => runTest("Basic Connection", "/api/interview/test-gemini-live")} disabled={isLoading}>
          Test Basic Connection
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Results from Live API tests</CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-muted-foreground">No tests run yet</p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{result.test}</h3>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  <pre className="text-sm bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(result.success ? result.result : result.error, null, 2)}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(result.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
