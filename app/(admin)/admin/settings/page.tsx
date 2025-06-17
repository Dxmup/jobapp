import type { Metadata } from "next"
import { AdminRoleSettings } from "@/components/admin/admin-role-settings"
import { PermissionGate } from "@/components/admin/permission-gate"

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Admin panel settings",
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-gray-500">Manage admin panel settings and configurations</p>
      </div>

      <div className="grid gap-6">
        <PermissionGate
          role="super_admin"
          fallback={<div className="text-red-500">You need super admin privileges to manage roles</div>}
        >
          <AdminRoleSettings />
        </PermissionGate>
      </div>
    </div>
  )
}
