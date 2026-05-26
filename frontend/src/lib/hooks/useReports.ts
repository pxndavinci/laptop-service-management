import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { ServiceCompletionReport, ProductUsageReport, RevenueReport } from '../../types'

const mockCompletionReport: ServiceCompletionReport = {
  dateRange: {
    start: '2026-05-01',
    end: '2026-05-27',
  },
  totalOrders: 156,
  completedOrders: 98,
  pendingOrders: 42,
  averageCompletionTime: 3.5,
  totalRevenue: 24580,
}

const mockProductUsageReport: ProductUsageReport = {
  dateRange: {
    start: '2026-05-01',
    end: '2026-05-27',
  },
  products: [
    { productId: 'P001', productName: 'Screen Replacement', usageCount: 32, revenue: 14400 },
    { productId: 'P002', productName: 'Battery Replacement', usageCount: 24, revenue: 6720 },
    { productId: 'P005', productName: 'SSD Installation', usageCount: 18, revenue: 5760 },
    { productId: 'P003', productName: 'RAM Upgrade', usageCount: 15, revenue: 3000 },
    { productId: 'P004', productName: 'Motherboard Repair', usageCount: 8, revenue: 2800 },
  ],
}

const mockRevenueReport: RevenueReport = {
  dateRange: {
    start: '2026-05-01',
    end: '2026-05-27',
  },
  byMonth: [
    { month: 'May 1-7', revenue: 3500, orderCount: 18 },
    { month: 'May 8-14', revenue: 5200, orderCount: 24 },
    { month: 'May 15-21', revenue: 8100, orderCount: 35 },
    { month: 'May 22-27', revenue: 7780, orderCount: 28 },
  ],
  byCategory: [
    { category: 'Display', revenue: 14400, orderCount: 32 },
    { category: 'Power', revenue: 6720, orderCount: 24 },
    { category: 'Storage', revenue: 5760, orderCount: 18 },
    { category: 'Memory', revenue: 3000, orderCount: 15 },
    { category: 'Repair', revenue: 2800, orderCount: 8 },
  ],
}

interface ReportParams {
  startDate?: string
  endDate?: string
}

export const useServiceCompletionReport = (params?: ReportParams) => {
  return useQuery({
    queryKey: ['reports', 'completion', params],
    queryFn: async () => {
      try {
        const response = await client.get<ServiceCompletionReport>(
          ENDPOINTS.reports.serviceCompletion,
          { params }
        )
        return response.data
      } catch (error) {
        console.log('[v0] Using mock service completion report')
        return mockCompletionReport
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useProductUsageReport = (params?: ReportParams) => {
  return useQuery({
    queryKey: ['reports', 'products', params],
    queryFn: async () => {
      try {
        const response = await client.get<ProductUsageReport>(
          ENDPOINTS.reports.productUsage,
          { params }
        )
        return response.data
      } catch (error) {
        console.log('[v0] Using mock product usage report')
        return mockProductUsageReport
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useRevenueReport = (params?: ReportParams) => {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: async () => {
      try {
        const response = await client.get<RevenueReport>(
          ENDPOINTS.reports.revenue,
          { params }
        )
        return response.data
      } catch (error) {
        console.log('[v0] Using mock revenue report')
        return mockRevenueReport
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}
