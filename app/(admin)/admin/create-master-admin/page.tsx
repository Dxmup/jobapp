"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Copy, ArrowRight } from "lucide-react"

export default function CreateMasterAdminPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  async function runMigrations() {
    setIsLoading(true)
    setError(null)
    setLogs([])

    try {
      // Step 1: Create exec_sql function
      addLog("Creating exec_sql function...")
      const execSqlResponse = await fetch("/api/admin/create-exec-sql-function")
      if (!execSqlResponse.ok) {
        const data = await execSqlResponse.json()
        throw new Error(data.error || "Failed to create exec_sql function")
      }
      addLog("✓ exec_sql function created successfully")

      // Step 2: Ensure roles table exists
      setStep(2)
      addLog("Creating roles tables...")
      const rolesResponse = await fetch("/api/admin/ensure-roles-table")
      if (!rolesResponse.ok) {
        const data = await rolesResponse.json()
        throw new Error(data.error || "Failed to create roles table")
      }
      addLog("✓ Roles tables created successfully")

      // Step 3: Create master admin
      setStep(3)
      addLog("Creating master admin account...")
      const adminResponse = await fetch("/api/admin/create-master-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const adminData = await adminResponse.json()

      if (!adminResponse.ok || !adminData.success) {
        throw new Error(adminData.error || "Failed to create master admin account")
      }

      setCredentials({
        email: adminData.email,
        password: adminData.password,
      })

      addLog("✓ Master admin account created successfully")
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      addLog(`❌ Error: ${err instanceof Error ? err.message : "An unknown error occurred"}`)
    } finally {
      setIsLoading(false)
    }
  }

  function addLog(message: string) {
    setLogs((prev) => [...prev, message])
  }

  function copyToClipboard() {
    if (!credentials) return

    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`
    navigator.clipboard.writeText(text)
    setCopied(true)

    setTimeout(() => setCopied(false), 2000)
  }

  // Auto-run on page load
  useEffect(() => {
    runMigrations()
  }, [])

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Master Admin Setup</CardTitle>
          <CardDescription>Setting up your secure administrator account</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                {step === 1
                  ? "Setting up database functions..."
                  : step === 2
                    ? "Creating roles tables..."
                    : "Generating admin credentials..."}
              </p>
            </div>
          )}

          {/* Display logs */}
          {logs.length > 0 && (
            <div className="my-4 p-2 bg-muted rounded-md max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono py-0.5">
                  {log}
                </div>
              ))}
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 4 && credentials && (
            <div className="space-y-4 mt-4">
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Master admin account created successfully
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">Email:</p>
                  <p className="text-sm font-mono bg-muted p-1 rounded">{credentials.email}</p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">Password:</p>
                  <p className="text-sm font-mono bg-muted p-1 rounded">{credentials.password}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-amber-800 text-sm">
                  <strong>Important:</strong> Save these credentials securely. The password cannot be retrieved later.
                </p>
              </div>

              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/admin/login")}>
                  Go to Admin Login <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {step === 4 && credentials && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={runMigrations} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating
                </>
              ) : (
                "Regenerate Credentials"
              )}
            </Button>

            <Button
              onClick={copyToClipboard}
              disabled={!credentials || isLoading}
              className={copied ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {copied ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Credentials
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
