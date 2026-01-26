"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { serviceOrders, statusOptions, getStatusColor } from "@/lib/mock-data"
import type { ServiceStatus, ServiceOrder } from "@/lib/types"
import { Edit, Save } from "lucide-react"

export function AdminOrdersTab() {
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
  const [newStatus, setNewStatus] = useState<ServiceStatus | "">("")
  const [statusNote, setStatusNote] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const openEditDialog = (order: ServiceOrder) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setStatusNote("")
    setIsDialogOpen(true)
  }

  const handleSaveStatus = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSaving(false)
    setIsDialogOpen(false)
    // In a real app, you would update the order here
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Service Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">
                      #{order.tagNo}
                    </TableCell>
                    <TableCell>{order.userProduct.user.name}</TableCell>
                    <TableCell>
                      {order.userProduct.product.brand.name} {order.userProduct.product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(order.status)}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>P{order.priorityLevel}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(order)}
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Update Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Service Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order #{selectedOrder?.tagNo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <Badge variant="secondary" className={getStatusColor(selectedOrder?.status || "CREATED")}>
                {selectedOrder?.status?.replace("_", " ")}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newStatus">New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as ServiceStatus)}
              >
                <SelectTrigger id="newStatus">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusNote">Status Note (Optional)</Label>
              <Textarea
                id="statusNote"
                placeholder="Add a note about this status change..."
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStatus} disabled={isSaving || !newStatus}>
              <Save className="mr-1 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
