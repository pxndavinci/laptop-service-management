"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { users, products, brands } from "@/lib/mock-data"
import type { IssueType, PaymentMethod } from "@/lib/types"
import { User, Laptop, FileText, DollarSign, CheckCircle } from "lucide-react"

const issueTypes: IssueType[] = ["HARDWARE", "SOFTWARE", "NETWORK", "OTHER"]
const paymentMethods: PaymentMethod[] = [
  "CASH",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "ONLINE_PAYMENT",
  "OTHER",
]
const priorityLevels = [
  { value: "1", label: "Critical" },
  { value: "2", label: "High" },
  { value: "3", label: "Medium" },
  { value: "4", label: "Low" },
  { value: "5", label: "Lowest" },
]

export function CreateOrderForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    userId: "",
    productId: "",
    serialNumber: "",
    additionalInfo: "",
    issueType: "" as IssueType | "",
    issueNotes: "",
    priorityLevel: "3",
    estimatedPrice: "",
    paymentMethod: "" as PaymentMethod | "",
    estimatedCompletionDate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Redirect after showing success
    setTimeout(() => {
      router.push("/service-orders")
    }, 2000)
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Service Order Created
          </h2>
          <p className="text-center text-muted-foreground">
            Your service order has been submitted successfully. Redirecting to orders list...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Customer Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Select Customer *</Label>
            <Select
              value={formData.userId}
              onValueChange={(value) => updateField("userId", value)}
            >
              <SelectTrigger id="userId">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Product Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productId">Select Product *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => updateField("productId", value)}
              >
                <SelectTrigger id="productId">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.brand.name} {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
                placeholder="e.g., DELL-2024-001234"
                value={formData.serialNumber}
                onChange={(e) => updateField("serialNumber", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Device Info</Label>
            <Input
              id="additionalInfo"
              placeholder="e.g., 16GB RAM, 512GB SSD"
              value={formData.additionalInfo}
              onChange={(e) => updateField("additionalInfo", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Issue Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Issue Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issueType">Issue Type *</Label>
              <Select
                value={formData.issueType}
                onValueChange={(value) => updateField("issueType", value)}
              >
                <SelectTrigger id="issueType">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priorityLevel">Priority Level *</Label>
              <Select
                value={formData.priorityLevel}
                onValueChange={(value) => updateField("priorityLevel", value)}
              >
                <SelectTrigger id="priorityLevel">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueNotes">Issue Description *</Label>
            <Textarea
              id="issueNotes"
              placeholder="Describe the issue in detail..."
              rows={4}
              value={formData.issueNotes}
              onChange={(e) => updateField("issueNotes", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Payment */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Pricing & Payment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estimatedPrice">Estimated Price ($)</Label>
              <Input
                id="estimatedPrice"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.estimatedPrice}
                onChange={(e) => updateField("estimatedPrice", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => updateField("paymentMethod", value)}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedCompletionDate">Est. Completion Date</Label>
            <Input
              id="estimatedCompletionDate"
              type="date"
              value={formData.estimatedCompletionDate}
              onChange={(e) => updateField("estimatedCompletionDate", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/service-orders")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Service Order"}
        </Button>
      </div>
    </form>
  )
}
