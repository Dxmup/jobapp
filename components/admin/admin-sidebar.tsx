"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"
import { Menu, X } from "lucide-react"
import { useAdminRoles } from "@/hooks/use-admin-roles"
import { PermissionGate } from "@/components/admin/permission-gate"

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useSidebar()
  const { hasRole, isLoading } = useAdminRoles()

  const routes = [
    {
      title: "Dashboard",
      href: "/admin",
      role: "admin",
    },
    {
      title: "Users",
      href: "/admin/users",
      role: "admin",
    },
    {
      title: "Content",
      href: "/admin/content",
      role: "editor",
    },
    {
      title: "Testimonials",
      href: "/admin/testimonials",
      role: "editor",
    },
    {
      title: "Audit Logs",
      href: "/admin/audit-logs",
      role: "admin",
    },
    {
      title: "Migrations",
      href: "/admin/migrations",
      role: "super_admin",
    },
    {
      title: "Settings",
      href: "/admin/settings",
      role: "admin",
    },
  ]

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden absolute left-4 top-3 z-40">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <MobileSidebar routes={routes} pathname={pathname} />
        </SheetContent>
      </Sheet>
      <div className={cn("hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-30 bg-gray-900", className)}>
        <div className="flex flex-col h-full py-6">
          <div className="px-6 mb-6">
            <Link href="/admin" className="flex items-center">
              <span className="text-2xl font-bold text-white">Admin Panel</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1">
              {routes.map((route) => (
                <PermissionGate key={route.href} role={route.role}>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md",
                      pathname === route.href
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800",
                    )}
                  >
                    {route.title}
                  </Link>
                </PermissionGate>
              ))}
            </div>
          </ScrollArea>
          <div className="px-6 mt-6">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full bg-transparent text-white border-gray-700 hover:bg-gray-800">
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function MobileSidebar({ routes, pathname }: { routes: any[]; pathname: string }) {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <Link href="/admin" className="flex items-center">
          <span className="text-xl font-bold">Admin Panel</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetTrigger>
        </Sheet>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <PermissionGate key={route.href} role={route.role}>
              <Link
                href={route.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md",
                  pathname === route.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800",
                )}
              >
                {route.title}
              </Link>
            </PermissionGate>
          ))}
        </div>
      </ScrollArea>
      <div className="px-6 py-4 border-t border-gray-800">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full bg-transparent text-white border-gray-700 hover:bg-gray-800">
            Back to App
          </Button>
        </Link>
      </div>
    </div>
  )
}
