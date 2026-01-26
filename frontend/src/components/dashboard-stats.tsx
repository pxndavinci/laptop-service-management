"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { serviceOrders } from "@/lib/mock-data"
import { ClipboardList, Clock, CheckCircle, AlertCircle } from "lucide-react"

export function DashboardStats() {
  const totalOrders = serviceOrders.length
  const inProgress = serviceOrders.filter(
    (o) => o.status === "IN_PROGRESS" || o.status === "RECEIVED"
  ).length
  const completed = serviceOrders.filter(
    (o) => o.status === "COMPLETED" || o.status === "DELIVERED"
  ).length
  const pending = serviceOrders.filter((o) => o.status === "CREATED").length

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ClipboardList,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Pending Pickup",
      value: pending,
      icon: AlertCircle,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
