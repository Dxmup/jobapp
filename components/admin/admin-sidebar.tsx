"use client"

import { LayoutDashboard, Settings, User, MessageSquare } from "lucide-react"
import { usePathname } from "next/navigation"

import { MainNav } from "@/components/main-nav"
import { SidebarNavItem } from "@/components/sidebar-nav-item"

interface SidebarProps {
  items?: {
    href: string
    icon: any
    label: string
  }[]
}

export function AdminSidebar({ items }: SidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: pathname === "/admin",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: User,
      current: pathname === "/admin/users",
    },
    {
      name: "Prompts",
      href: "/admin/prompts",
      icon: MessageSquare,
      current: pathname === "/admin/prompts",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: pathname === "/admin/settings",
    },
  ]

  return (
    <div className="flex flex-col space-y-6 w-full">
      <MainNav className="px-6" />
      <div className="flex-1 space-y-1">
        {navigation.map((item) => (
          <SidebarNavItem key={item.href} href={item.href} icon={item.icon} label={item.name} />
        ))}
      </div>
    </div>
  )
}
