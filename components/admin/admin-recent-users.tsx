"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

type User = {
  id: string
  name: string
  email: string
  created_at: string
  last_login?: string
  subscription_status?: string
}

export function AdminRecentUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecentUsers() {
      try {
        const response = await fetch("/api/admin/recent-users")
        if (!response.ok) {
          throw new Error("Failed to fetch recent users")
        }
        const data = await response.json()
        setUsers(data.users)
      } catch (err) {
        console.error("Error fetching recent users:", err)
        setError("Failed to load recent users")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentUsers()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>A list of recent users and their activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-5 text-sm text-muted-foreground">
              <div>User</div>
              <div>Status</div>
              <div>Plan</div>
              <div>Joined</div>
              <div className="text-right">Actions</div>
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-5 items-center gap-4 rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>A list of recent users and their activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>A list of recent users and their activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-5 text-sm text-muted-foreground">
            <div>User</div>
            <div>Status</div>
            <div>Plan</div>
            <div>Joined</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="space-y-2">
            {users.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No users found</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="grid grid-cols-5 items-center gap-4 rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=32&width=32&query=${user.name}`}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name || "No name"}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div>
                    <Badge variant={user.last_login ? "default" : "secondary"}>
                      {user.last_login ? "active" : "inactive"}
                    </Badge>
                  </div>
                  <div>{user.subscription_status || "Free"}</div>
                  <div>{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</div>
                  <div className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-center">
            <Button variant="outline">View All Users</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
