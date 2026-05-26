// Service Order Types
export type ServiceOrderStatus = 'draft' | 'pending' | 'in-progress' | 'completed' | 'cancelled'
export type ServiceOrderPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface StatusTimeline {
  status: ServiceOrderStatus
  timestamp: string
  changedBy: string
}

export interface ServiceOrder {
  id: string
  orderNumber: string
  customerId: string
  productId: string
  description: string
  status: ServiceOrderStatus
  priority: ServiceOrderPriority
  estimatedCompletionDate: string
  actualCompletionDate?: string
  totalCost: number
  notes: string
  statusTimeline: StatusTimeline[]
  createdAt: string
  updatedAt: string
}

// Customer Types
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  zipCode?: string
  createdAt: string
  updatedAt: string
}

// Product Types
export interface Product {
  id: string
  name: string
  category: string
  unitPrice: number
  description?: string
  inStock: boolean
  createdAt: string
  updatedAt: string
}

// Dashboard Types
export interface DashboardMetrics {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  totalRevenue: number
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  status: ServiceOrderStatus
  priority: ServiceOrderPriority
  createdAt: string
}

export interface TrendDataPoint {
  date: string
  completed: number
  pending: number
  cancelled: number
}

// Report Types
export interface ServiceCompletionReport {
  dateRange: {
    start: string
    end: string
  }
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  averageCompletionTime: number
  totalRevenue: number
}

export interface ProductUsageReport {
  dateRange: {
    start: string
    end: string
  }
  products: Array<{
    productId: string
    productName: string
    usageCount: number
    revenue: number
  }>
}

export interface RevenueReport {
  dateRange: {
    start: string
    end: string
  }
  byMonth: Array<{
    month: string
    revenue: number
    orderCount: number
  }>
  byCategory: Array<{
    category: string
    revenue: number
    orderCount: number
  }>
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
