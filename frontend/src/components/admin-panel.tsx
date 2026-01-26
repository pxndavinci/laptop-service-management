"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminOrdersTab } from "./admin-orders-tab"
import { AdminUsersTab } from "./admin-users-tab"
import { AdminProductsTab } from "./admin-products-tab"
import { ClipboardList, Users, Laptop } from "lucide-react"

export function AdminPanel() {
  return (
    <Tabs defaultValue="orders" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:gap-2">
        <TabsTrigger value="orders" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          <span className="hidden sm:inline">Service Orders</span>
          <span className="sm:hidden">Orders</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="gap-2">
          <Users className="h-4 w-4" />
          <span>Users</span>
        </TabsTrigger>
        <TabsTrigger value="products" className="gap-2">
          <Laptop className="h-4 w-4" />
          <span>Products</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="orders">
        <AdminOrdersTab />
      </TabsContent>
      <TabsContent value="users">
        <AdminUsersTab />
      </TabsContent>
      <TabsContent value="products">
        <AdminProductsTab />
      </TabsContent>
    </Tabs>
  )
}
