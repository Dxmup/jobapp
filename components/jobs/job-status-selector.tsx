"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Check, ChevronDown } from "lucide-react"

interface JobStatusSelectorProps {
  jobId: string
  currentStatus: string
}

export function JobStatusSelector({ jobId, currentStatus }: JobStatusSelectorProps) {
  const [status, setStatus] = useState(currentStatus)
  const { toast } = useToast()

  // Update status when props change
  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  // Complete list of statuses in the correct order
  const statuses = [
    { value: "saved", label: "Saved" },
    { value: "drafting", label: "Drafting" },
    { value: "applied", label: "Applied" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offer", label: "Offer Received" },
    { value: "rejected", label: "Rejected" },
  ]

  const statusColors = {
    saved: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
    drafting:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:hover:bg-yellow-800",
    applied: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800",
    interviewing:
      "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100 dark:hover:bg-purple-800",
    offer:
      "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800",
    rejected: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800",
  }

  // Completely rewritten function to handle status changes
  const handleStatusChange = async (newStatus: string) => {
    try {
      // Make the API call to update the status
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update job status: ${response.statusText}`)
      }

      // Update local state immediately for better UX
      setStatus(newStatus)

      // Show success toast
      toast({
        title: "Status Updated",
        description: `Job application status updated to ${statuses.find((s) => s.value === newStatus)?.label}.`,
      })

      // Dispatch a custom event to notify other components of the status change
      const event = new CustomEvent("jobStatusChanged", {
        detail: { jobId, newStatus },
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "There was a problem updating the status.",
        variant: "destructive",
      })
    }
  }

  // Normalize the current status for display
  let normalizedStatus = status.toLowerCase()
  if (normalizedStatus === "interview") normalizedStatus = "interviewing"
  if (normalizedStatus === "offer received") normalizedStatus = "offer"

  // Find the status object for the current status
  const currentStatusObj = statuses.find((s) => s.value === normalizedStatus) || statuses[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`${statusColors[normalizedStatus as keyof typeof statusColors] || statusColors.saved}`}
        >
          {currentStatusObj.label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statuses.map((statusOption) => (
          <DropdownMenuItem
            key={statusOption.value}
            onClick={() => handleStatusChange(statusOption.value)}
            className="flex items-center justify-between"
          >
            {statusOption.label}
            {normalizedStatus === statusOption.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
