"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Copy } from "lucide-react"
import { MigrationSequence } from "@/components/admin/migration-sequence"
import Link from "next/link"

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function createMasterAdmin() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/create-master-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create master admin account")
      }

      setCredentials({
        email: data.email,
        password: data.password,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  function copyToClipboard() {
    if (!credentials) return

    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`
    navigator.clipboard.writeText(text)
    setCopied(true)

    setTimeout(() => setCopied(false), 2000)
  }

  // Auto-generate on page load
  useEffect(() => {
    createMasterAdmin()
  }, [])

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Admin Panel Setup</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <MigrationSequence />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Master Admin</h2>
        <p className="mb-4">
          After the migrations have completed successfully, click the button below to create a master admin account.
        </p>
        <div className="flex justify-center">
          <Link href="/admin/create-master-admin">
            <Button>Create Master Admin</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Log in with the master admin credentials</li>
          <li>Create additional admin users</li>
          <li>Configure role permissions</li>
          <li>Set up two-factor authentication</li>
        </ul>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Master Admin Setup</CardTitle>
          <CardDescription>Creating a secure master administrator account</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Generating secure credentials...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {credentials && (
            <div className="space-y-4">
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
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={createMasterAdmin} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating
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
      </Card>
    </div>
  )
}
