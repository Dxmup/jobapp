"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Activity,
  Database,
  Settings,
  ChevronRight,
} from "lucide-react"

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      description: "Overview & analytics",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
      description: "Manage user accounts",
    },
    {
      title: "Content",
      href: "/admin/content",
      icon: FileText,
      description: "Templates & prompts",
    },
    {
      title: "Prompts",
      href: "/admin/prompts",
      icon: FileText,
      description: "Manage system prompts",
    },
    {
      title: "Blogs",
      href: "/admin/blogs",
      icon: FileText,
      description: "Manage blog content",
    },
    {
      title: "Testimonials",
      href: "/admin/testimonials",
      icon: MessageSquare,
      description: "User testimonials",
    },
    {
      title: "Testing",
      href: "/admin/testing",
      icon: Activity,
      description: "System testing suite",
    },
    {
      title: "Audit Logs",
      href: "/admin/audit-logs",
      icon: Activity,
      description: "System activity",
    },
    {
      title: "Migrations",
      href: "/admin/migrations",
      icon: Database,
      description: "Database migrations",
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      description: "System configuration",
    },
  ]

  return (
    <div
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 overflow-y-auto",
        className,
      )}
    >
      <div className="p-6">
        <nav className="space-y-2">
          {routes.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.href

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")}
                  />
                  <div>
                    <div className="font-medium text-sm">{route.title}</div>
                    <div className={cn("text-xs", isActive ? "text-blue-600" : "text-gray-400")}>
                      {route.description}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isActive ? "text-blue-600 rotate-90" : "text-gray-300 group-hover:text-gray-400",
                  )}
                />
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
