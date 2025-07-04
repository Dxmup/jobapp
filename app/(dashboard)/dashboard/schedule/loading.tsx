import { CalendarSkeleton } from "@/components/schedule/calendar-skeleton"
import { CalendarHeader } from "@/components/schedule/calendar-header"

export default function ScheduleLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <CalendarHeader />
      <CalendarSkeleton />
    </div>
  )
}
