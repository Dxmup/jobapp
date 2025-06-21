import { getCurrentUserId } from "@/lib/auth-cookie"

export async function getDashboardData() {
  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  // Simulate fetching data for the dashboard
  const dashboardData = {
    userId: userId,
    userName: "Example User",
    totalOrders: 120,
    pendingOrders: 15,
    revenue: 15000,
  }

  return { data: dashboardData }
}
