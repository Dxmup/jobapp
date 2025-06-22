import { Suspense } from "react"
import { CalendarSchedule } from "@/components/schedule/calendar-schedule"
import { CalendarSkeleton } from "@/components/schedule/calendar-skeleton"
import { CalendarHeader } from "@/components/schedule/calendar-header"

export const metadata = {
  title: "Schedule | CareerAI",
  description: "View and manage your job application schedule and events",
}

export default function SchedulePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <CalendarHeader />
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarSchedule />
      </Suspense>
    </div>
  )
}
