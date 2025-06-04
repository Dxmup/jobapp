import { Loader2 } from "lucide-react"

export default function BuildResumeLoading() {
  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
      </div>

      <div className="h-1 bg-muted rounded"></div>

      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
        <div className="h-4 w-full bg-muted rounded animate-pulse"></div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-muted rounded animate-pulse"></div>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <div className="h-10 w-28 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-28 bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}
