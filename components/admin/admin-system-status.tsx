import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function AdminSystemStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Current status of system components and services.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium">OpenAI API</div>
              <Badge
                variant="outline"
                className="text-green-500 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
              >
                Operational
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">Last checked: 5 minutes ago</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div>API Usage (Monthly Quota)</div>
              <div>65%</div>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium">Database</div>
              <Badge
                variant="outline"
                className="text-green-500 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
              >
                Operational
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">Last checked: 5 minutes ago</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div>Storage Usage</div>
              <div>42%</div>
            </div>
            <Progress value={42} className="h-2" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium">Authentication Service</div>
              <Badge
                variant="outline"
                className="text-green-500 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
              >
                Operational
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">Last checked: 5 minutes ago</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium">Payment Processing</div>
              <Badge
                variant="outline"
                className="text-green-500 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
              >
                Operational
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">Last checked: 5 minutes ago</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium">File Storage</div>
              <Badge
                variant="outline"
                className="text-yellow-500 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800"
              >
                Degraded
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">Last checked: 5 minutes ago</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Experiencing slower upload speeds. Engineering team is investigating.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
