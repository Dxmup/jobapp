import { EnhancedDashboardOverview } from "@/components/dashboard/enhanced-dashboard-overview"
import { QuickActionGrid } from "@/components/dashboard/quick-action-grid"
import { CommandMenu } from "@/components/ui/command-menu"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <CommandMenu />
      </div>

      <EnhancedDashboardOverview />

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActionGrid />
      </div>

      <Separator />
    </div>
  )
}
