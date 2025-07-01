"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Settings,
  BarChart3,
  FileText,
  MessageSquare,
  Database,
  Activity,
  TestTube,
  BookOpen,
  Star,
  Wrench,
  Home,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Prompts", href: "/admin/prompts", icon: MessageSquare },
  { name: "Blogs", href: "/admin/blogs", icon: BookOpen },
  { name: "Testimonials", href: "/admin/testimonials", icon: Star },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Migrations", href: "/admin/migrations", icon: Database },
  { name: "Testing", href: "/admin/testing", icon: TestTube },
  { name: "Setup", href: "/admin/setup", icon: Wrench },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 flex-shrink-0 items-center px-4">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                    "mr-3 h-5 w-5 flex-shrink-0",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
