"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { EnhancedDashboardHeader } from "@/components/dashboard/enhanced-dashboard-header"
import { EnhancedDashboardSidebar } from "@/components/dashboard/enhanced-dashboard-sidebar"
import { ContextualGuidance } from "@/components/contextual-guidance"
// import { QuickActionsMenu } from "@/components/dashboard/quick-actions-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="h-16 border-b border-white/10 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95" />
        <div className="flex flex-1">
          <div className="hidden md:block md:w-64 lg:w-72 border-r border-white/10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-800" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-cyan-100/20 dark:from-purple-900/20 dark:via-transparent dark:to-cyan-900/20 pointer-events-none" />

      <EnhancedDashboardHeader />
      <div className="flex flex-1 relative">
        {/* Sidebar - Always reserve space on desktop */}
        <div className="hidden md:block md:w-64 lg:w-72 flex-shrink-0">
          <EnhancedDashboardSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-800 border-r border-white/10">
              <EnhancedDashboardSidebar />
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 sm:p-6 relative">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
          <ContextualGuidance />
        </main>
      </div>
      {/* <QuickActionsMenu /> */}
    </div>
  )
}

export default DashboardLayout
