import { AdminOverviewStats } from "@/components/admin/admin-overview-stats"
import { AdminRecentUsers } from "@/components/admin/admin-recent-users"
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity"
import { AdminSystemStatus } from "@/components/admin/admin-system-status"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor and manage your CareerAI platform</p>
      </div>

      {/* Stats Overview */}
      <AdminOverviewStats />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminRecentUsers />
            <AdminRecentActivity />
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <AdminRecentUsers />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <AdminRecentActivity />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <AdminSystemStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
