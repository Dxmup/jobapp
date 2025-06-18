"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AutoMigrationRunner() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [isRetrying, setIsRetrying] = useState(false)

  const runMigration = async () => {
    try {
      setStatus("loading")
      setMessage("Creating exec_sql function...")

      // First create the exec_sql function
      const execSqlResponse = await fetch("/api/admin/create-exec-sql-function")
      const execSqlData = await execSqlResponse.json()

      if (!execSqlData.success) {
        setStatus("error")
        setMessage(`Failed to create exec_sql function: ${execSqlData.error || "Unknown error"}`)
        return
      }

      setMessage("Running roles migration...")

      // Then create the roles tables
      const response = await fetch("/api/admin/create-roles-tables")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Roles migration completed successfully!")
      } else {
        setStatus("error")
        setMessage(`Migration failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Migration error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsRetrying(false)
    }
  }

  const retryMigration = () => {
    setIsRetrying(true)
    runMigration()
  }

  useEffect(() => {
    runMigration()
  }, [])

  if (status === "idle") return null

  return (
    <Alert className={`mb-4 ${status === "success" ? "bg-green-50" : status === "error" ? "bg-red-50" : "bg-blue-50"}`}>
      <div className="flex items-center gap-2">
        {(status === "loading" || isRetrying) && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
        {status === "error" && !isRetrying && <AlertCircle className="h-4 w-4 text-red-600" />}
        <AlertTitle>
          {status === "success"
            ? "Migration Complete"
            : status === "error" && !isRetrying
              ? "Migration Failed"
              : "Running Migration"}
        </AlertTitle>
      </div>
      <AlertDescription>{message}</AlertDescription>
      {status === "error" && !isRetrying && (
        <Button onClick={retryMigration} size="sm" className="mt-2">
          Retry Migration
        </Button>
      )}
    </Alert>
  )
}
