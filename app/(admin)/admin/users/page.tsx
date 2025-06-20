"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AdminUserTable } from "@/components/admin/admin-user-table"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLogin: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // For now, using mock data since we don't have a users API endpoint
      const mockUsers: User[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "User",
          status: "Active",
          lastLogin: "2024-01-15",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "Admin",
          status: "Active",
          lastLogin: "2024-01-14",
        },
      ]
      setUsers(mockUsers)
    } catch (err) {
      setError("Failed to fetch users")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchUsers} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

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
          <AdminUserTable users={users} />
        </TabsContent>
        <TabsContent value="active" className="space-y-4 mt-6">
          <AdminUserTable users={users} filter="active" />
        </TabsContent>
        <TabsContent value="inactive" className="space-y-4 mt-6">
          <AdminUserTable users={users} filter="inactive" />
        </TabsContent>
        <TabsContent value="premium" className="space-y-4 mt-6">
          <AdminUserTable users={users} filter="premium" />
        </TabsContent>
        <TabsContent value="free" className="space-y-4 mt-6">
          <AdminUserTable users={users} filter="free" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
