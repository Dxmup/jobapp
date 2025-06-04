"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  FileEdit,
  CreditCard,
  Settings,
  HelpCircle,
  BarChart,
  MessageSquare,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Jobs",
    href: "/dashboard/jobs",
    icon: FolderKanban,
  },
  {
    title: "Resumes",
    href: "/dashboard/resumes",
    icon: FileText,
  },
  {
    title: "Cover Letters",
    href: "/dashboard/cover-letters",
    icon: FileEdit,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    title: "Subscription",
    href: "/dashboard/subscription",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
  {
    title: "Interview Prep",
    href: "/dashboard/interview-prep",
    icon: MessageSquare,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
      <div className="flex h-full flex-col gap-2 p-4">
        <nav className="grid gap-1 px-2 pt-2">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium">Free Plan</p>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 w-[60%]" />
              </div>
              <p className="text-xs text-muted-foreground">2/3 job applications used</p>
              <Link href="/dashboard/subscription">
                <div className="text-xs text-purple-600 hover:underline">Upgrade to Pro</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
