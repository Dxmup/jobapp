import { Separator } from "@/components/ui/separator"
import { ActionPlanOverview } from "@/components/action-plan/action-plan-overview"
import { ActionPlanTimeline } from "@/components/action-plan/action-plan-timeline"
import { ActionPlanCategories } from "@/components/action-plan/action-plan-categories"

export default function ActionPlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Action Plan</h1>
        <p className="text-muted-foreground mt-2">Your personalized roadmap to landing your dream job</p>
      </div>

      <Separator />

      <ActionPlanOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActionPlanTimeline />
        </div>
        <div>
          <ActionPlanCategories />
        </div>
      </div>
    </div>
  )
}
