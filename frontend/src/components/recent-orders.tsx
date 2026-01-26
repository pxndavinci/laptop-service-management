"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { serviceOrders, getStatusColor, getPriorityLabel, getPriorityColor } from "@/lib/mock-data"
import { ArrowRight } from "lucide-react"

export function RecentOrders() {
  const recentOrders = serviceOrders.slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Service Orders</CardTitle>
        <Link href="/service-orders">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/service-orders/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-foreground">
                    #{order.tagNo}
                  </span>
                  <Badge variant="secondary" className={getStatusColor(order.status)}>
                    {order.status.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(order.priorityLevel)}>
                    {getPriorityLabel(order.priorityLevel)}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{order.userProduct.user.name}</span>
                  <span>•</span>
                  <span>{order.userProduct.product.brand.name} {order.userProduct.product.name}</span>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
