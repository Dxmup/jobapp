"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function CalendarHeader() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleExportCalendar = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch("/api/calendar/export")

      if (!response.ok) {
        throw new Error("Failed to export calendar")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "career-events.ics")

      // Append to the document
      document.body.appendChild(link)

      // Trigger the download
      link.click()

      // Clean up
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Calendar exported",
        description: "Your events have been exported to an iCal file",
      })
    } catch (error) {
      console.error("Error exporting calendar:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your calendar",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyICalLink = async () => {
    try {
      const response = await fetch("/api/calendar/ical-link")

      if (!response.ok) {
        throw new Error("Failed to get iCal link")
      }

      const { url } = await response.json()

      await navigator.clipboard.writeText(url)

      toast({
        title: "iCal link copied",
        description: "The link has been copied to your clipboard",
      })
    } catch (error) {
      console.error("Error copying iCal link:", error)
      toast({
        title: "Failed to copy link",
        description: "There was an error generating your iCal link",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">View and manage your upcoming job application events</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleCopyICalLink} className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Copy iCal Link
        </Button>
        <Button onClick={handleExportCalendar} disabled={isGenerating} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Export Calendar"}
        </Button>
      </div>
    </div>
  )
}
