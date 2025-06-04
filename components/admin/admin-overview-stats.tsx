import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Users, FileText, CreditCard, Zap } from "lucide-react"

export function AdminOverviewStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,248</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-green-500 flex items-center">
              <ArrowUpRight className="h-3 w-3" /> 12%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8,492</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-green-500 flex items-center">
              <ArrowUpRight className="h-3 w-3" /> 18%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$12,432</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-green-500 flex items-center">
              <ArrowUpRight className="h-3 w-3" /> 9%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Usage</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1.2M</div>
          <p className="text-xs text-muted-foreground">tokens used this month</p>
        </CardContent>
      </Card>
    </div>
  )
}
