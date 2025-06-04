"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { AuditLog } from "@/types/auth"
import { format } from "date-fns"

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    resource: "",
  })

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: "10",
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.resource && { resource: filters.resource }),
      })

      const response = await fetch(`/api/admin/audit-logs?${queryParams.toString()}`)
      const data = await response.json()

      setLogs(data.logs)
      setTotal(data.total)
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, filters])

  const totalPages = Math.ceil(total / 10)

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filters change
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>Track all administrative actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1">
              <Input
                placeholder="Filter by user ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={filters.resource} onValueChange={(value) => handleFilterChange("resource", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ userId: "", action: "", resource: "" })
                setPage(1)
              }}
            >
              Reset
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Resource ID</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}</TableCell>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.resourceId || "-"}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i

                  if (pageNumber <= 0 || pageNumber > totalPages) return null

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink isActive={page === pageNumber} onClick={() => setPage(pageNumber)}>
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
