"use client"

import type React from "react"
import { EnhancedDashboardHeader } from "@/components/dashboard/enhanced-dashboard-header"
import { EnhancedDashboardSidebar } from "@/components/dashboard/enhanced-dashboard-sidebar"
import { ContextualGuidance } from "@/components/contextual-guidance"
import { QuickActionsMenu } from "@/components/dashboard/quick-actions-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-cyan-100/20 dark:from-purple-900/20 dark:via-transparent dark:to-cyan-900/20 pointer-events-none" />

      <EnhancedDashboardHeader />
      <div className="flex flex-1 relative">
        <EnhancedDashboardSidebar />
        <main className="flex-1 p-6 relative">
          <div className="max-w-7xl mx-auto">{children}</div>
          <ContextualGuidance />
        </main>
      </div>
      <QuickActionsMenu />
    </div>
  )
}

export default DashboardLayout
