import { JobCarousel } from "./job-carousel"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function EnhancedDashboardOverview() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Last month revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>Last month subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
            <CardDescription>Last month sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Now</CardTitle>
            <CardDescription>Realtime active users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
      {/* Job Cards Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Job Applications</h2>
        </div>
        <JobCarousel />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-5">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Recent activities on your account</CardDescription>
          </CardHeader>
          <CardContent className="pl-2"></CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>Search for anything</CardDescription>
          </CardHeader>
          <CardContent className="pl-2"></CardContent>
        </Card>
      </div>
    </>
  )
}
