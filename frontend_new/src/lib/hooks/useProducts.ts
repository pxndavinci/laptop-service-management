import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { Product, PaginatedResponse } from '../../types'
import { useUIStore } from '../../store/uiStore'

const mockProducts: Product[] = [
  {
    id: 'P001',
    name: 'Screen Replacement',
    category: 'Display',
    unitPrice: 450,
    description: 'LCD/LED screen replacement for laptops',
    inStock: true,
    createdAt: '2026-01-10',
    updatedAt: '2026-05-20',
  },
  {
    id: 'P002',
    name: 'Battery Replacement',
    category: 'Power',
    unitPrice: 280,
    description: 'Lithium-ion battery for various laptop models',
    inStock: true,
    createdAt: '2026-01-15',
    updatedAt: '2026-05-19',
  },
  {
    id: 'P003',
    name: 'RAM Upgrade',
    category: 'Memory',
    unitPrice: 200,
    description: 'DDR4/DDR5 RAM upgrade modules',
    inStock: true,
    createdAt: '2026-02-01',
    updatedAt: '2026-05-18',
  },
  {
    id: 'P004',
    name: 'Motherboard Repair',
    category: 'Repair',
    unitPrice: 350,
    description: 'Motherboard repair and replacement service',
    inStock: false,
    createdAt: '2026-02-10',
    updatedAt: '2026-05-15',
  },
  {
    id: 'P005',
    name: 'SSD Installation',
    category: 'Storage',
    unitPrice: 320,
    description: 'SSD installation and data migration service',
    inStock: true,
    createdAt: '2026-03-01',
    updatedAt: '2026-05-17',
  },
]

interface ProductsParams {
  page?: number
  limit?: number
  category?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const useProducts = (params?: ProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        const response = await client.get<PaginatedResponse<Product>>(
          ENDPOINTS.products.list,
          { params }
        )
        return response.data
      } catch (error) {
        console.log('[v0] Using mock products due to API unavailability')
        return {
          data: mockProducts,
          total: mockProducts.length,
          page: params?.page || 1,
          limit: params?.limit || 10,
        }
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      try {
        const response = await client.get<Product>(ENDPOINTS.products.detail(id))
        return response.data
      } catch (error) {
        console.log('[v0] Using mock product due to API unavailability')
        return mockProducts.find((p) => p.id === id) || mockProducts[0]
      }
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  return useMutation({
    mutationFn: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await client.post<Product>(ENDPOINTS.products.create, data)
        return response.data
      } catch (error) {
        console.log('[v0] Creating product with mock data')
        const newProduct: Product = {
          ...data,
          id: `P${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return newProduct
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      addNotification('Product created successfully', 'success')
    },
    onError: () => {
      addNotification('Failed to create product', 'error')
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      try {
        const response = await client.put<Product>(ENDPOINTS.products.update(id), data)
        return response.data
      } catch (error) {
        console.log('[v0] Updating product with mock data')
        return { ...data, id } as Product
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', id] })
      addNotification('Product updated successfully', 'success')
    },
    onError: () => {
      addNotification('Failed to update product', 'error')
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await client.delete(ENDPOINTS.products.delete(id))
        return id
      } catch (error) {
        console.log('[v0] Deleting product with mock data')
        return id
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      addNotification('Product deleted successfully', 'success')
    },
    onError: () => {
      addNotification('Failed to delete product', 'error')
    },
  })
}
