import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminPanel } from "@/components/admin-panel"

export default function AdminPage() {
  return (
    <DashboardLayout
      title="Admin Panel"
      description="Manage service orders, users, and products"
    >
      <AdminPanel />
    </DashboardLayout>
  )
}
