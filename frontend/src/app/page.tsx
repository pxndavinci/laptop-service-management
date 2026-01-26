import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview of your service management system"
    >
      <DashboardStats />
      <div className="mt-8">
        <RecentOrders />
      </div>
    </DashboardLayout>
  )
}
