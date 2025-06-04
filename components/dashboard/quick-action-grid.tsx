"use client"

import { ActionButton } from "@/components/dashboard/action-button"
import { Briefcase, FileText, PenTool, Calendar, Sparkles, BarChart, User, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuickActionGrid() {
  const router = useRouter()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <ActionButton
        icon={Briefcase}
        label="Track Job"
        description="Add a new job application"
        onClick={() => router.push("/dashboard/jobs/new")}
      />

      <ActionButton
        icon={FileText}
        label="Create Resume"
        description="Build or upload a resume"
        onClick={() => router.push("/dashboard/build-resume")}
      />

      <ActionButton
        icon={PenTool}
        label="Write Cover Letter"
        description="Generate a tailored letter"
        onClick={() => router.push("/dashboard/cover-letters/new")}
      />

      <ActionButton
        icon={Sparkles}
        label="Optimize Resume"
        description="AI-powered customization"
        onClick={() => router.push("/dashboard/customize-resume")}
      />

      <ActionButton
        icon={Calendar}
        label="Schedule Interview"
        description="Track upcoming interviews"
        onClick={() => router.push("/dashboard/schedule")}
      />

      <ActionButton
        icon={User}
        label="Interview Prep"
        description="Practice common questions"
        onClick={() => router.push("/dashboard/interview-prep")}
      />

      <ActionButton
        icon={BarChart}
        label="View Analytics"
        description="Track your progress"
        onClick={() => router.push("/dashboard/analytics")}
      />

      <ActionButton
        icon={Clock}
        label="Recent Activity"
        description="See your latest actions"
        onClick={() => router.push("/dashboard/recent-activity")}
      />
    </div>
  )
}
