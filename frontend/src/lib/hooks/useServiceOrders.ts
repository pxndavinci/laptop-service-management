import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { ServiceOrder, PaginatedResponse } from '../../types'
import { useUIStore } from '../../store/uiStore'
import { getFallbackCustomerName } from './useCustomers'

// Mock data
let mockServiceOrders: ServiceOrder[] = [
  {
    id: '1',
    orderNumber: 'SO-001',
    customerId: 'C001',
    productId: 'P001',
    description: 'Screen replacement for MacBook Pro',
    status: 'completed',
    priority: 'high',
    estimatedCompletionDate: '2026-05-25',
    actualCompletionDate: '2026-05-24',
    totalCost: 450,
    notes: 'Completed ahead of schedule',
    statusTimeline: [
      { status: 'pending', timestamp: '2026-05-21', changedBy: 'admin' },
      { status: 'in-progress', timestamp: '2026-05-22', changedBy: 'tech1' },
      { status: 'completed', timestamp: '2026-05-24', changedBy: 'tech1' },
    ],
    createdAt: '2026-05-21',
    updatedAt: '2026-05-24',
  },
  {
    id: '2',
    orderNumber: 'SO-002',
    customerId: 'C002',
    productId: 'P002',
    description: 'Battery replacement for Dell XPS',
    status: 'in-progress',
    priority: 'urgent',
    estimatedCompletionDate: '2026-05-26',
    totalCost: 280,
    notes: 'Customer waiting',
    statusTimeline: [
      { status: 'pending', timestamp: '2026-05-22', changedBy: 'admin' },
      { status: 'in-progress', timestamp: '2026-05-23', changedBy: 'tech2' },
    ],
    createdAt: '2026-05-22',
    updatedAt: '2026-05-23',
  },
  {
    id: '3',
    orderNumber: 'SO-003',
    customerId: 'C003',
    productId: 'P003',
    description: 'RAM upgrade for HP Pavilion',
    status: 'pending',
    priority: 'medium',
    estimatedCompletionDate: '2026-05-27',
    totalCost: 200,
    notes: 'Waiting for parts',
    statusTimeline: [
      { status: 'pending', timestamp: '2026-05-23', changedBy: 'admin' },
    ],
    createdAt: '2026-05-23',
    updatedAt: '2026-05-23',
  },
  {
    id: '4',
    orderNumber: 'SO-004',
    customerId: 'C004',
    productId: 'P004',
    description: 'Motherboard repair for Lenovo ThinkPad',
    status: 'completed',
    priority: 'low',
    estimatedCompletionDate: '2026-05-25',
    actualCompletionDate: '2026-05-25',
    totalCost: 350,
    notes: 'Repaired successfully',
    statusTimeline: [
      { status: 'pending', timestamp: '2026-05-20', changedBy: 'admin' },
      { status: 'in-progress', timestamp: '2026-05-21', changedBy: 'tech1' },
      { status: 'completed', timestamp: '2026-05-25', changedBy: 'tech1' },
    ],
    createdAt: '2026-05-20',
    updatedAt: '2026-05-25',
  },
  {
    id: '5',
    orderNumber: 'SO-005',
    customerId: 'C005',
    productId: 'P005',
    description: 'SSD installation for ASUS VivoBook',
    status: 'pending',
    priority: 'high',
    estimatedCompletionDate: '2026-05-28',
    totalCost: 320,
    notes: 'High priority customer',
    statusTimeline: [
      { status: 'pending', timestamp: '2026-05-24', changedBy: 'admin' },
    ],
    createdAt: '2026-05-24',
    updatedAt: '2026-05-24',
  },
]

interface ServiceOrdersParams {
  page?: number
  limit?: number
  status?: string
  priority?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const useServiceOrders = (params?: ServiceOrdersParams) => {
  return useQuery({
    queryKey: ['serviceOrders', params],
    queryFn: async () => {
      try {
        const response = await client.get<PaginatedResponse<ServiceOrder>>(
          ENDPOINTS.serviceOrders.list,
          { params }
        )
        return response.data
      } catch (error) {
        console.log('[v0] Using mock service orders due to API unavailability')
        const search = params?.search?.trim().toLowerCase()
        const filteredOrders = mockServiceOrders.filter((order) => {
          const matchesStatus = !params?.status || order.status === params.status
          const matchesPriority = !params?.priority || order.priority === params.priority
          const searchableText =
            `${order.orderNumber} ${getFallbackCustomerName(order.customerId)} ${order.description}`.toLowerCase()
          const matchesSearch = !search || searchableText.includes(search)

          return matchesStatus && matchesPriority && matchesSearch
        })
        const page = params?.page || 1
        const limit = params?.limit || 10
        const start = (page - 1) * limit

        return {
          data: filteredOrders.slice(start, start + limit),
          total: filteredOrders.length,
          page,
          limit,
        }
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useServiceOrder = (id: string) => {
  return useQuery({
    queryKey: ['serviceOrders', id],
    queryFn: async () => {
      try {
        const response = await client.get<ServiceOrder>(ENDPOINTS.serviceOrders.detail(id))
        return response.data
      } catch (error) {
        console.log('[v0] Using mock service order due to API unavailability')
        return mockServiceOrders.find((o) => o.id === id) || mockServiceOrders[0]
      }
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  })
}

export const useCreateServiceOrder = () => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  return useMutation({
    mutationFn: async (data: Omit<ServiceOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusTimeline'>) => {
      try {
        const response = await client.post<ServiceOrder>(ENDPOINTS.serviceOrders.create, data)
        return response.data
      } catch (error) {
        console.log('[v0] Creating service order with mock data')
        // Mock: return the data with generated ID
        const newOrder: ServiceOrder = {
          ...data,
          id: `${Date.now()}`,
          orderNumber: `SO-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          statusTimeline: [
            {
              status: data.status,
              timestamp: new Date().toISOString(),
              changedBy: 'current-user',
            },
          ],
        }
        mockServiceOrders = [newOrder, ...mockServiceOrders]
        return newOrder
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] })
      addNotification('Service order created successfully', 'success')
    },
    onError: () => {
      addNotification('Failed to create service order', 'error')
    },
  })
}

export const useUpdateServiceOrder = () => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<ServiceOrder>
    }) => {
      try {
        const response = await client.put<ServiceOrder>(ENDPOINTS.serviceOrders.update(id), data)
        return response.data
      } catch (error) {
        console.log('[v0] Updating service order with mock data')
        return { ...data, id } as ServiceOrder
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] })
      queryClient.invalidateQueries({ queryKey: ['serviceOrders', id] })
      addNotification('Service order updated successfully', 'success')
    },
    onError: () => {
      addNotification('Failed to update service order', 'error')
    },
  })
}

export const useDeleteServiceOrder = () => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await client.delete(ENDPOINTS.serviceOrders.delete(id))
        return id
      } catch (error) {
        console.log('[v0] Deleting service order with mock data')
        return id
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] })
      addNotification('Service order deleted successfully', 'success')
    },
    onError: () => {
      addNotification('Failed to delete service order', 'error')
    },
  })
}
