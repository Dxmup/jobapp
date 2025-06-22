export function CalendarSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-8 bg-muted rounded animate-pulse"></div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}
