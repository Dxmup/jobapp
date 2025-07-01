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
  TestTube,
  Activity,
  BookOpen,
  Star,
  Wrench,
  MessageCircle,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Content Management",
    href: "/admin/content",
    icon: FileText,
  },
  {
    title: "Prompts",
    href: "/admin/prompts",
    icon: MessageCircle,
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    icon: BookOpen,
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: Star,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
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
    title: "Setup",
    href: "/admin/setup",
    icon: Wrench,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Admin Panel</h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
