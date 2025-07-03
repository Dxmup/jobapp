import { getUserById } from "@/lib/auth-service"
import { UserRoleManager } from "@/components/admin/user-role-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div>
              <span className="font-medium">Name:</span> {user.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Created:</span> {new Date(user.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Last Login:</span>{" "}
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
            </div>
            <div>
              <span className="font-medium">Status:</span> {user.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </CardContent>
      </Card>

      <UserRoleManager userId={user.id} userName={user.name} />
    </div>
  )
}
