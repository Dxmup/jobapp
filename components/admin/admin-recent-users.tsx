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

const users = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    status: "active",
    plan: "Premium",
    joined: "Mar 12, 2023",
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.c@example.com",
    status: "active",
    plan: "Free",
    joined: "Apr 5, 2023",
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    status: "inactive",
    plan: "Premium",
    joined: "Jan 22, 2023",
    lastActive: "2 weeks ago",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.k@example.com",
    status: "active",
    plan: "Enterprise",
    joined: "May 18, 2023",
    lastActive: "3 hours ago",
  },
  {
    id: "5",
    name: "Jessica Taylor",
    email: "jessica.t@example.com",
    status: "active",
    plan: "Free",
    joined: "Jun 2, 2023",
    lastActive: "Just now",
  },
]

export function AdminRecentUsers() {
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
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-5 items-center gap-4 rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`/abstract-geometric-shapes.png?height=32&width=32&query=${user.name}`}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                </div>
                <div>{user.plan}</div>
                <div>{user.joined}</div>
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
            ))}
          </div>
          <div className="flex justify-center">
            <Button variant="outline">View All Users</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
