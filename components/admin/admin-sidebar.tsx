"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Settings,
  BarChart3,
  FileText,
  Database,
  MessageSquare,
  Activity,
  Home,
  TestTube,
  Wrench,
  BookOpen,
  Zap,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Overview",
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
    title: "Blogs",
    href: "/admin/blogs",
    icon: BookOpen,
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquare,
  },
  {
    title: "Prompts",
    href: "/admin/prompts",
    icon: Zap,
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: Activity,
  },
  {
    title: "Testing",
    href: "/admin/testing",
    icon: TestTube,
  },
  {
    title: "Migrations",
    href: "/admin/migrations",
    icon: Database,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Setup",
    href: "/admin/setup",
    icon: Wrench,
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
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
