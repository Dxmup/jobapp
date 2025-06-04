import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, UserPlus, CreditCard, Settings, AlertCircle } from "lucide-react"

const activities = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
    },
    action: "created a new job application",
    target: "Software Engineer at Google",
    time: "2 hours ago",
    icon: FileText,
  },
  {
    id: "2",
    user: {
      name: "Michael Chen",
      email: "michael.c@example.com",
    },
    action: "upgraded to Premium plan",
    target: "",
    time: "5 hours ago",
    icon: CreditCard,
  },
  {
    id: "3",
    user: {
      name: "New User",
      email: "emily.r@example.com",
    },
    action: "registered an account",
    target: "",
    time: "1 day ago",
    icon: UserPlus,
  },
  {
    id: "4",
    user: {
      name: "David Kim",
      email: "david.k@example.com",
    },
    action: "reported an issue",
    target: "Resume generation error",
    time: "2 days ago",
    icon: AlertCircle,
  },
  {
    id: "5",
    user: {
      name: "Jessica Taylor",
      email: "jessica.t@example.com",
    },
    action: "updated account settings",
    target: "",
    time: "3 days ago",
    icon: Settings,
  },
]

export function AdminRecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Recent user activities across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="rounded-full bg-muted p-2">
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={`/abstract-geometric-shapes.png?height=24&width=24&query=${activity.user.name}`}
                      alt={activity.user.name}
                    />
                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{activity.user.name}</span>
                  <span className="text-muted-foreground">{activity.action}</span>
                  {activity.target && <span className="font-medium">{activity.target}</span>}
                </div>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
