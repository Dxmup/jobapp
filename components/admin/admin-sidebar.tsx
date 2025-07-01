"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  MessageSquare,
  Shield,
  Database,
  Activity,
  TestTube,
  BookOpen,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Prompts",
    href: "/admin/prompts",
    icon: MessageSquare,
  },
  {
    name: "Blogs",
    href: "/admin/blogs",
    icon: BookOpen,
  },
  {
    name: "Testimonials",
    href: "/admin/testimonials",
    icon: FileText,
  },
  {
    name: "Audit Logs",
    href: "/admin/audit-logs",
    icon: Activity,
  },
  {
    name: "Testing",
    href: "/admin/testing",
    icon: TestTube,
  },
  {
    name: "Migrations",
    href: "/admin/migrations",
    icon: Database,
  },
  {
    name: "2FA Setup",
    href: "/admin/verify-2fa",
    icon: Shield,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center bg-gray-800">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
