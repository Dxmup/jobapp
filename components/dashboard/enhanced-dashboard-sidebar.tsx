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
  MessageSquare,
  Calendar,
  Zap,
  Star,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Jobs",
    href: "/dashboard/jobs",
    icon: FolderKanban,
    gradient: "from-purple-500 to-pink-500",
    badge: "3",
  },
  {
    title: "Resumes",
    href: "/dashboard/resumes",
    icon: FileText,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Cover Letters",
    href: "/dashboard/cover-letters",
    icon: FileEdit,
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Interview Prep",
    href: "/dashboard/interview-prep",
    icon: MessageSquare,
    gradient: "from-violet-500 to-purple-500",
    badge: "New",
  },
  {
    title: "Schedule",
    href: "/dashboard/schedule",
    icon: Calendar,
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    title: "Subscription",
    href: "/dashboard/subscription",
    icon: CreditCard,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    gradient: "from-gray-500 to-slate-500",
  },
  {
    title: "Help & Support",
    href: "/dashboard/help",
    icon: HelpCircle,
    gradient: "from-teal-500 to-cyan-500",
  },
]

export function EnhancedDashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r border-white/10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-800 md:block md:w-64 lg:w-72 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />

      <div className="relative flex h-full flex-col gap-2 p-4">
        <nav className="grid gap-2 px-2 pt-2">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-white/15 to-white/5 text-white shadow-lg border border-white/20"
                    : "text-white/70 hover:text-white hover:bg-white/10",
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-r-full" />
                )}

                {/* Icon with gradient background */}
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                    isActive ? `bg-gradient-to-br ${item.gradient} shadow-lg` : "bg-white/10 group-hover:bg-white/20",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-all duration-300",
                      isActive ? "text-white" : "text-white/70 group-hover:text-white",
                    )}
                  />
                </div>

                <span className="flex-1">{item.title}</span>

                {/* Badge */}
                {item.badge && (
                  <Badge
                    className={cn(
                      "text-xs px-2 py-0.5 border-0",
                      item.badge === "New"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse"
                        : "bg-gradient-to-r from-purple-500 to-cyan-500 text-white",
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Upgrade Card */}
        <div className="mt-auto">
          <div className="relative rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/10 backdrop-blur-sm p-6 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-cyan-600/10" />

            <div className="relative flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Free Plan</p>
                  <p className="text-xs text-white/60">Limited features</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">Usage</span>
                  <span className="text-white">2/3 jobs</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 w-[66%] rounded-full" />
                </div>
              </div>

              <Link href="/dashboard/subscription">
                <div className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Upgrade to Pro
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
