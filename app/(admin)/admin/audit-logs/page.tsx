import { Separator } from "@/components/ui/separator"
import { AuditLogViewer } from "@/components/admin/audit-log"

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">View a complete history of administrative actions in the system.</p>
      </div>
      <Separator />
      <AuditLogViewer />
    </div>
  )
}
