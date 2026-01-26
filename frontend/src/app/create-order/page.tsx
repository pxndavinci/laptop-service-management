import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateOrderForm } from "@/components/create-order-form"

export default function CreateOrderPage() {
  return (
    <DashboardLayout
      title="Create Service Order"
      description="Submit a new service order for a customer"
    >
      <CreateOrderForm />
    </DashboardLayout>
  )
}
