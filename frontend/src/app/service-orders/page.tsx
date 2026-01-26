import { DashboardLayout } from "@/components/dashboard-layout"
import { ServiceOrdersTable } from "@/components/service-orders-table"

export default function ServiceOrdersPage() {
  return (
    <DashboardLayout
      title="Service Orders"
      description="Manage and track all service orders"
    >
      <ServiceOrdersTable />
    </DashboardLayout>
  )
}
