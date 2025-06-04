import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
    jobApplications: 12,
    location: "New York, USA",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.c@example.com",
    status: "active",
    plan: "Free",
    joined: "Apr 5, 2023",
    lastActive: "1 day ago",
    jobApplications: 5,
    location: "San Francisco, USA",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    status: "inactive",
    plan: "Premium",
    joined: "Jan 22, 2023",
    lastActive: "2 weeks ago",
    jobApplications: 8,
    location: "Chicago, USA",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.k@example.com",
    status: "active",
    plan: "Enterprise",
    joined: "May 18, 2023",
    lastActive: "3 hours ago",
    jobApplications: 20,
    location: "Austin, USA",
  },
  {
    id: "5",
    name: "Jessica Taylor",
    email: "jessica.t@example.com",
    status: "active",
    plan: "Free",
    joined: "Jun 2, 2023",
    lastActive: "Just now",
    jobApplications: 3,
    location: "Seattle, USA",
  },
  {
    id: "6",
    name: "Robert Johnson",
    email: "robert.j@example.com",
    status: "active",
    plan: "Premium",
    joined: "Feb 15, 2023",
    lastActive: "5 hours ago",
    jobApplications: 15,
    location: "Boston, USA",
  },
  {
    id: "7",
    name: "Lisa Wong",
    email: "lisa.w@example.com",
    status: "inactive",
    plan: "Free",
    joined: "Jul 10, 2023",
    lastActive: "1 month ago",
    jobApplications: 2,
    location: "Portland, USA",
  },
  {
    id: "8",
    name: "James Smith",
    email: "james.s@example.com",
    status: "active",
    plan: "Free",
    joined: "Aug 5, 2023",
    lastActive: "2 days ago",
    jobApplications: 7,
    location: "Denver, USA",
  },
]

export function AdminUserTable({ filter }: { filter?: string }) {
  // Filter users based on the provided filter
  const filteredUsers = filter
    ? users.filter((user) => {
        if (filter === "active" || filter === "inactive") {
          return user.status === filter
        }
        if (filter === "premium") {
          return user.plan === "Premium"
        }
        if (filter === "free") {
          return user.plan === "Free"
        }
        return true
      })
    : users

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                </TableCell>
                <TableCell>{user.plan}</TableCell>
                <TableCell>{user.location}</TableCell>
                <TableCell>{user.jobApplications}</TableCell>
                <TableCell>{user.joined}</TableCell>
                <TableCell>{user.lastActive}</TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
