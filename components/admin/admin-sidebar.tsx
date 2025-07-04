"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LogOut } from "lucide-react"

interface AdminSidebarProps {
  className?: string
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
  },
  {
    title: "Content",
    href: "/admin/content",
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
  },
  {
    title: "Settings",
    href: "/admin/settings",
  },
  {
    title: "Permissions",
    href: "/admin/permissions",
  },
  {
    title: "Database",
    href: "/admin/database",
  },
]

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full w-64 flex-col bg-gray-900 text-white p-4", className)}>
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded transition-colors",
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.title}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-800 p-4 mt-auto">
        <button className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 rounded hover:bg-gray-800 hover:text-white transition-colors">
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
