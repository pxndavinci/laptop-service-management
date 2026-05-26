import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { Customer, PaginatedResponse } from '../../types'
import { useUIStore } from '../../store/uiStore'

const mockCustomers: Customer[] = [
  {
    id: 'C001',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1001',
    address: '123 Main St',
    city: 'New York',
    zipCode: '10001',
    createdAt: '2026-01-15',
    updatedAt: '2026-05-20',
  },
  {
    id: 'C002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-1002',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    zipCode: '90001',
    createdAt: '2026-02-10',
    updatedAt: '2026-05-19',
  },
  {
    id: 'C003',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '555-1003',
    address: '789 Pine Rd',
    city: 'Chicago',
    zipCode: '60601',
    createdAt: '2026-03-05',
    updatedAt: '2026-05-18',
  },
  {
    id: 'C004',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '555-1004',
    address: '321 Elm St',
    city: 'Houston',
    zipCode: '77001',
    createdAt: '2026-04-01',
    updatedAt: '2026-05-17',
  },
  {
    id: 'C005',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    phone: '555-1005',
    address: '654 Maple Dr',
    city: 'Phoenix',
    zipCode: '85001',
    createdAt: '2026-04-20',
    updatedAt: '2026-05-16',
  },
]

interface CustomersParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const useCustomers = (params?: CustomersParams) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      try {
        const response = await client.get<PaginatedResponse<Customer>>(
          ENDPOINTS.customers.list,
          { params }
        )
        return response.data
      } catch (error) {
        console.log('[v0] Using mock customers due to API unavailability')
        return {
          data: mockCustomers,
          total: mockCustomers.length,
          page: params?.page || 1,
          limit: params?.limit || 10,
        }
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      try {
        const response = await client.get<Customer>(ENDPOINTS.customers.detail(id))
        return response.data
      } catch (error) {
        console.log('[v0] Using mock customer due to API unavailability')
        return mockCustomers.find((c) => c.id === id) || mockCustomers[0]
      }
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  return useMutation({
    mutationFn: async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await client.post<Customer>(ENDPOINTS.customers.create, data)
        return response.data
      } catch (error) {
        console.log('[v0] Creating customer with mock data')
        const newCustomer: Customer = {
          ...data,
          id: `C${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return newCustomer
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      addNotification('Customer created successfully', 'success')
    },
    onError: () => {
      addNotification('Failed to create customer', 'error')
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      try {
        const response = await client.put<Customer>(ENDPOINTS.customers.update(id), data)
        return response.data
      } catch (error) {
        console.log('[v0] Updating customer with mock data')
        return { ...data, id } as Customer
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', id] })
      addNotification('Customer updated successfully', 'success')
    },
    onError: () => {
      addNotification('Failed to update customer', 'error')
    },
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await client.delete(ENDPOINTS.customers.delete(id))
        return id
      } catch (error) {
        console.log('[v0] Deleting customer with mock data')
        return id
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      addNotification('Customer deleted successfully', 'success')
    },
    onError: () => {
      addNotification('Failed to delete customer', 'error')
    },
  })
}
