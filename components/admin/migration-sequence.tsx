"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type MigrationStatus = "idle" | "loading" | "success" | "error"

interface MigrationState {
  execSql: {
    status: MigrationStatus
    message: string
  }
  rolesTables: {
    status: MigrationStatus
    message: string
  }
  permissionsTables: {
    status: MigrationStatus
    message: string
  }
}

export function MigrationSequence() {
  const [state, setState] = useState<MigrationState>({
    execSql: { status: "idle", message: "" },
    rolesTables: { status: "idle", message: "" },
    permissionsTables: { status: "idle", message: "" },
  })

  const [isRunning, setIsRunning] = useState(false)

  async function runMigrations() {
    setIsRunning(true)
    await createExecSqlFunction()
  }

  async function createExecSqlFunction() {
    setState((prev) => ({
      ...prev,
      execSql: { status: "loading", message: "Creating exec_sql function..." },
    }))

    try {
      const response = await fetch("/api/admin/create-exec-sql-function")
      const data = await response.json()

      if (data.success) {
        setState((prev) => ({
          ...prev,
          execSql: { status: "success", message: "exec_sql function created successfully" },
        }))
        // Continue with the next migration
        await createRolesTables()
      } else {
        setState((prev) => ({
          ...prev,
          execSql: { status: "error", message: `Error: ${data.error || "Unknown error"}` },
        }))
        setIsRunning(false)
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        execSql: {
          status: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      }))
      setIsRunning(false)
    }
  }

  async function createRolesTables() {
    setState((prev) => ({
      ...prev,
      rolesTables: { status: "loading", message: "Creating roles tables..." },
    }))

    try {
      const response = await fetch("/api/admin/create-roles-tables")
      const data = await response.json()

      if (data.success) {
        setState((prev) => ({
          ...prev,
          rolesTables: { status: "success", message: "Roles tables created successfully" },
        }))
        // Continue with the next migration
        await createPermissionsTables()
      } else {
        setState((prev) => ({
          ...prev,
          rolesTables: { status: "error", message: `Error: ${data.error || "Unknown error"}` },
        }))
        setIsRunning(false)
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        rolesTables: {
          status: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      }))
      setIsRunning(false)
    }
  }

  async function createPermissionsTables() {
    setState((prev) => ({
      ...prev,
      permissionsTables: { status: "loading", message: "Creating permissions tables..." },
    }))

    try {
      const response = await fetch("/api/admin/create-permissions-tables")
      const data = await response.json()

      if (data.success) {
        setState((prev) => ({
          ...prev,
          permissionsTables: { status: "success", message: "Permissions tables created successfully" },
        }))
      } else {
        setState((prev) => ({
          ...prev,
          permissionsTables: { status: "error", message: `Error: ${data.error || "Unknown error"}` },
        }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        permissionsTables: {
          status: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      }))
    }
    setIsRunning(false)
  }

  // Auto-run migrations on component mount
  useEffect(() => {
    runMigrations()
  }, [])

  function renderStatus(status: MigrationStatus, message: string) {
    if (status === "idle") return null

    return (
      <Alert
        className={`mb-2 ${status === "success" ? "bg-green-50" : status === "error" ? "bg-red-50" : "bg-blue-50"}`}
      >
        <div className="flex items-center gap-2">
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
          {status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
          <AlertTitle>{status === "success" ? "Success" : status === "error" ? "Error" : "Running"}</AlertTitle>
        </div>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Database Migrations</h2>
      <div className="space-y-2">
        {renderStatus(state.execSql.status, state.execSql.message)}
        {renderStatus(state.rolesTables.status, state.rolesTables.message)}
        {renderStatus(state.permissionsTables.status, state.permissionsTables.message)}
      </div>
      {(state.execSql.status === "error" ||
        state.rolesTables.status === "error" ||
        state.permissionsTables.status === "error") && (
        <Button onClick={runMigrations} disabled={isRunning} className="mt-4">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Migrations
            </>
          ) : (
            "Retry Migrations"
          )}
        </Button>
      )}
    </div>
  )
}
