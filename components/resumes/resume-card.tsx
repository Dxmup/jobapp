"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { FileText, MoreHorizontal, Edit, Copy, Trash, Download, ExternalLink, Briefcase } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { AssociateJobDialog } from "./associate-job-dialog"

interface ResumeCardProps {
  resume: {
    id: string
    title: string
    createdAt: string
    updatedAt: string
    status: "draft" | "ready" | "optimized"
    jobCount: number
  }
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
}

export function ResumeCard({ resume, onDelete, onDuplicate }: ResumeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showAssociateDialog, setShowAssociateDialog] = useState(false)

  const statusColors = {
    draft: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100",
    ready: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100",
    optimized: "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100",
  }

  const statusLabels = {
    draft: "Draft",
    ready: "Ready",
    optimized: "AI Optimized",
  }

  return (
    <>
      <Card
        className={`overflow-hidden transition-all duration-200 ${isHovered ? "shadow-md" : "shadow-sm"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative pt-12">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-purple-600 to-cyan-500" />
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/resumes/view/${resume.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>View Resume</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/resumes/view/${resume.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Resume</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAssociateDialog(true)}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Associate with Job</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(resume.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/resumes/view/${resume.id}`}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download PDF</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete?.(resume.id)} className="text-red-600 focus:text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="absolute top-4 left-4 h-12 w-12 rounded-full bg-white shadow-md flex items-center justify-center">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{resume.title}</h3>
          </div>
          <div className="flex items-center justify-between mb-4">
            <Badge className={statusColors[resume.status]}>{statusLabels[resume.status]}</Badge>
            <span className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Used in {resume.jobCount} job application{resume.jobCount !== 1 ? "s" : ""}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/40 p-3">
          <div className="flex w-full justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/resumes/view/${resume.id}`}>View</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/dashboard/customize-resume?resumeId=${resume.id}`}>Customize for Job</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AssociateJobDialog resumeId={resume.id} open={showAssociateDialog} onOpenChange={setShowAssociateDialog} />
    </>
  )
}

export function ResumeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative pt-12">
        <Skeleton className="absolute top-0 left-0 right-0 h-8" />
        <Skeleton className="absolute top-4 left-4 h-12 w-12 rounded-full" />
      </div>
      <CardContent className="pt-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter className="border-t p-3">
        <div className="flex w-full justify-between">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
      </CardFooter>
    </Card>
  )
}
