import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AdminUserTable } from "@/components/admin/admin-user-table"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts, subscriptions, and permissions.</p>
      </div>
      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input placeholder="Search users..." className="w-[300px]" />
          <Button variant="outline">Search</Button>
        </div>
        <Button>Add User</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 mt-6">
          <AdminUserTable />
        </TabsContent>
        <TabsContent value="active" className="space-y-4 mt-6">
          <AdminUserTable filter="active" />
        </TabsContent>
        <TabsContent value="inactive" className="space-y-4 mt-6">
          <AdminUserTable filter="inactive" />
        </TabsContent>
        <TabsContent value="premium" className="space-y-4 mt-6">
          <AdminUserTable filter="premium" />
        </TabsContent>
        <TabsContent value="free" className="space-y-4 mt-6">
          <AdminUserTable filter="free" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
