"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Mail, Target, Building2, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Job {
  id: string
  title: string
  company: string
  status: string
  created_at: string
}

interface JobCardProps {
  job: Job
  onJobDeleted?: () => void
}

export function JobCard({ job, onJobDeleted }: JobCardProps) {
  const { toast } = useToast()
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "interviewing":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "offer":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const handleDeleteJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete job")
      }

      toast({
        title: "Job deleted",
        description: `"${job.title}" has been permanently deleted.`,
      })

      onJobDeleted?.()
      router.refresh()
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm hover:from-white/10 hover:to-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg w-full h-[140px] flex flex-col">
      <CardHeader className="pb-1 p-2 flex-shrink-0 min-h-0">
        <div className="flex items-start justify-between gap-1 min-w-0">
          <div className="space-y-0.5 flex-1 min-w-0">
            <CardTitle className="text-xs font-semibold text-foreground truncate leading-tight">{job.title}</CardTitle>
            <div className="flex items-center gap-1 text-muted-foreground min-w-0">
              <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="text-[10px] truncate flex-1">{job.company}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge
              className={`${getStatusColor(job.status)} border text-[8px] px-1 py-0.5 flex-shrink-0 whitespace-nowrap`}
            >
              {job.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-3 h-3" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/jobs/${job.id}`} className="flex items-center">
                    <Edit className="w-4 h-4 mr-2" />
                    View & Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <DeleteConfirmationDialog
                    title="Delete Job"
                    description="Are you sure you want to delete this job? This will also delete all associated resumes, cover letters, and timeline events."
                    itemName={`${job.title} at ${job.company}`}
                    onConfirm={handleDeleteJob}
                    trigger={
                      <div className="flex items-center w-full px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer rounded-sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Job
                      </div>
                    }
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 p-2 flex-1 flex flex-col justify-center min-h-0">
        <div className="space-y-0.5 flex-1 flex flex-col justify-center">
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-[10px] h-5 px-1.5 min-h-0"
            asChild
          >
            <Link href={`/jobs/${job.id}/optimize-resume`} className="flex items-center justify-start gap-1">
              <FileText className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">Resume</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-[10px] h-5 px-1.5 min-h-0"
            asChild
          >
            <Link href={`/jobs/${job.id}/generate-cover-letter`} className="flex items-center justify-start gap-1">
              <Mail className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">Cover Letter</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-[10px] h-5 px-1.5 min-h-0"
            asChild
          >
            <Link href={`/dashboard/interview-prep?jobId=${job.id}`} className="flex items-center justify-start gap-1">
              <Target className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">Interview Prep</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
