"use client" // Ensure this is a client component if it uses client-side hooks like usePathname in its children

import type React from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { ContextualGuidance } from "@/components/contextual-guidance"
import { QuickActionsMenu } from "@/components/dashboard/quick-actions-menu" // Import the QuickActionsMenu

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          {children}
          <ContextualGuidance />
        </main>
      </div>
      <QuickActionsMenu /> {/* Add the QuickActionsMenu here */}
    </div>
  )
}

export default DashboardLayout
