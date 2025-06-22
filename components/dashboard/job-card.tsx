"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Mail, Target, Building2 } from "lucide-react"
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
}

export function JobCard({ job }: JobCardProps) {
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
          <Badge
            className={`${getStatusColor(job.status)} border text-[8px] px-1 py-0.5 flex-shrink-0 whitespace-nowrap`}
          >
            {job.status}
          </Badge>
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
