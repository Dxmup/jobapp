"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Settings, BarChart3, FileText, Shield, Database, MessageSquare, Home, LogOut } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: FileText,
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquare,
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Permissions",
    href: "/admin/permissions",
    icon: Shield,
  },
  {
    title: "Database",
    href: "/admin/database",
    icon: Database,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <button className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors">
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
