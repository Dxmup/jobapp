"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Database,
  TestTube,
  BookOpen,
  Home,
  LogOut,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Audit Logs",
    href: "/admin/audit-logs",
    icon: Shield,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Content",
    href: "/admin/content",
    icon: FileText,
  },
  {
    name: "Blogs",
    href: "/admin/blogs",
    icon: BookOpen,
  },
  {
    name: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquare,
  },
  {
    name: "Prompts",
    href: "/admin/prompts",
    icon: Zap,
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
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      window.location.href = "/admin/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800",
                  isActive
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    : "text-gray-600 dark:text-gray-400",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export default AdminSidebar
