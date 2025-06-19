import { JobCarousel } from "@/components/dashboard/job-carousel"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { mockJobs } from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here's what's happening with your job search</p>
      </div>

      <DashboardStats />

      <JobCarousel jobs={mockJobs} />
    </div>
  )
}
