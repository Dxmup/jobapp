import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-full max-w-md" />

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-full max-w-xs" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-full max-w-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-full max-w-xs" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
