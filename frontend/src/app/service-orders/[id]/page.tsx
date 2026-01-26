import { DashboardLayout } from "@/components/dashboard-layout"
import { ServiceOrderDetail } from "@/components/service-order-detail"
import { serviceOrders } from "@/lib/mock-data"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ServiceOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const order = serviceOrders.find((o) => o.id === id)

  if (!order) {
    notFound()
  }

  return (
    <DashboardLayout
      title={`Service Order #${order.tagNo}`}
      description="View and manage service order details"
    >
      <ServiceOrderDetail order={order} />
    </DashboardLayout>
  )
}
