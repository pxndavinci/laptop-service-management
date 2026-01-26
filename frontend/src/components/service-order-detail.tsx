"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import type { ServiceOrder } from "@/lib/types"
import { getStatusColor, getPriorityLabel, getPriorityColor } from "@/lib/mock-data"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  User,
  Laptop,
  Calendar,
  DollarSign,
  Clock,
  Mail,
  Phone,
  MapPin,
  Tag,
  FileText,
} from "lucide-react"

interface ServiceOrderDetailProps {
  order: ServiceOrder
}

export function ServiceOrderDetail({ order }: ServiceOrderDetailProps) {
  const [isUserExpanded, setIsUserExpanded] = useState(false)
  const [isProductExpanded, setIsProductExpanded] = useState(false)

  return (
    <div className="space-y-6">
      <Link href="/service-orders">
        <Button variant="ghost" size="sm" className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
      </Link>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Order Summary</CardTitle>
              <Badge variant="secondary" className={getStatusColor(order.status)}>
                {order.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getPriorityColor(order.priorityLevel)}>
                {getPriorityLabel(order.priorityLevel)} Priority
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <Tag className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tag Number</p>
                <p className="font-mono font-semibold text-foreground">#{order.tagNo}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Issue Type</p>
                <Badge variant="outline">{order.issueType}</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium text-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            {order.estimatedCompletionDate && (
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Est. Completion</p>
                  <p className="font-medium text-foreground">
                    {new Date(order.estimatedCompletionDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Est. Price</p>
                <p className="font-semibold text-foreground">
                  {order.estimatedPrice ? `$${order.estimatedPrice.toFixed(2)}` : "TBD"}
                </p>
              </div>
            </div>
            {order.finalPrice && (
              <div className="flex items-start gap-3">
                <DollarSign className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Final Price</p>
                  <p className="font-semibold text-emerald-600">
                    ${order.finalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
          {order.issueNotes && (
            <>
              <Separator className="my-6" />
              <div>
                <h4 className="mb-2 font-medium text-foreground">Issue Notes</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {order.issueNotes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Service Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {order.timeline.map((entry, index) => (
              <div key={entry.id} className="relative flex gap-4 pb-8 last:pb-0">
                {index !== order.timeline.length - 1 && (
                  <div className="absolute left-3 top-6 h-full w-0.5 bg-border" />
                )}
                <div className="relative z-10">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      index === order.timeline.length - 1
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        index === order.timeline.length - 1
                          ? "bg-primary-foreground"
                          : "bg-muted-foreground"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <Badge variant="secondary" className={getStatusColor(entry.status)}>
                      {entry.status.replace("_", " ")}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {entry.updatedBy && (
                      <span className="text-sm text-muted-foreground">
                        by {entry.updatedBy}
                      </span>
                    )}
                  </div>
                  {entry.note && (
                    <p className="mt-2 text-sm text-foreground">{entry.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Details (Expandable) */}
      <Collapsible open={isUserExpanded} onOpenChange={setIsUserExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Customer Details</CardTitle>
                </div>
                {isUserExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              {!isUserExpanded && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.userProduct.user.name} - {order.userProduct.user.email}
                </p>
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="border-t border-border pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">
                      {order.userProduct.user.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">
                      {order.userProduct.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">
                      {order.userProduct.user.phone}
                    </p>
                  </div>
                </div>
                {order.userProduct.user.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium text-foreground">
                        {order.userProduct.user.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Product Details (Expandable) */}
      <Collapsible open={isProductExpanded} onOpenChange={setIsProductExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Product Details</CardTitle>
                </div>
                {isProductExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              {!isProductExpanded && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.userProduct.product.brand.name} {order.userProduct.product.name} - SN: {order.userProduct.serialNumber}
                </p>
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="border-t border-border pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium text-foreground">
                    {order.userProduct.product.brand.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium text-foreground">
                    {order.userProduct.product.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product Type</p>
                  <p className="font-medium text-foreground">
                    {order.userProduct.product.productType.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-mono font-medium text-foreground">
                    {order.userProduct.serialNumber}
                  </p>
                </div>
                {order.userProduct.product.description && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium text-foreground">
                      {order.userProduct.product.description}
                    </p>
                  </div>
                )}
                {order.userProduct.additionalInfo && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Additional Info</p>
                    <p className="font-medium text-foreground">
                      {order.userProduct.additionalInfo}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}
