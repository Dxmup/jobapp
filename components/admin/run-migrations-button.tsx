"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function RunMigrationsButton() {
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const runMigrations = async () => {
    setIsRunning(true)
    try {
      const response = await fetch("/api/admin/add-user-id-to-job-resumes", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Database migrations completed successfully",
        })
      } else {
        throw new Error(result.error || "Migration failed")
      }
    } catch (error) {
      console.error("Error running migrations:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run migrations",
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Button onClick={runMigrations} disabled={isRunning}>
      {isRunning ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Running Migrations...
        </>
      ) : (
        "Run Database Migrations"
      )}
    </Button>
  )
}
