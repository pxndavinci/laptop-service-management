import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { DashboardMetrics, TrendDataPoint, RecentOrder } from '../../types'

// Mock data for fallback when API is unavailable
const mockMetrics: DashboardMetrics = {
  totalOrders: 156,
  completedOrders: 98,
  pendingOrders: 42,
  totalRevenue: 24580,
}

const mockTrendData: TrendDataPoint[] = [
  { date: '2026-05-18', completed: 8, pending: 5, cancelled: 1 },
  { date: '2026-05-19', completed: 12, pending: 8, cancelled: 2 },
  { date: '2026-05-20', completed: 10, pending: 6, cancelled: 0 },
  { date: '2026-05-21', completed: 15, pending: 9, cancelled: 1 },
  { date: '2026-05-22', completed: 11, pending: 7, cancelled: 2 },
  { date: '2026-05-23', completed: 14, pending: 10, cancelled: 1 },
  { date: '2026-05-24', completed: 16, pending: 8, cancelled: 0 },
]

const mockRecentOrders: RecentOrder[] = [
  {
    id: '1',
    orderNumber: 'SO-001',
    customerName: 'John Doe',
    status: 'completed',
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    orderNumber: 'SO-002',
    customerName: 'Jane Smith',
    status: 'in-progress',
    priority: 'urgent',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    orderNumber: 'SO-003',
    customerName: 'Bob Wilson',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    orderNumber: 'SO-004',
    customerName: 'Alice Johnson',
    status: 'completed',
    priority: 'low',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    orderNumber: 'SO-005',
    customerName: 'Charlie Brown',
    status: 'pending',
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
]

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      try {
        const response = await client.get<DashboardMetrics>(ENDPOINTS.dashboard.metrics)
        return response.data
      } catch (error) {
        console.log('[v0] Using mock dashboard metrics due to API unavailability')
        return mockMetrics
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useTrendData = () => {
  return useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: async () => {
      try {
        const response = await client.get<TrendDataPoint[]>(ENDPOINTS.dashboard.trendData)
        return response.data
      } catch (error) {
        console.log('[v0] Using mock trend data due to API unavailability')
        return mockTrendData
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useRecentOrders = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: async () => {
      try {
        const response = await client.get<RecentOrder[]>(ENDPOINTS.dashboard.recentOrders)
        return response.data
      } catch (error) {
        console.log('[v0] Using mock recent orders due to API unavailability')
        return mockRecentOrders
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}
