import { create } from 'zustand'
import { ServiceOrderStatus, ServiceOrderPriority } from '../types'

interface FilterState {
  // Service Orders filters
  serviceOrderStatus?: ServiceOrderStatus
  serviceOrderPriority?: ServiceOrderPriority
  serviceOrderSearch: string
  serviceOrderPage: number
  serviceOrderLimit: number
  serviceOrderSortBy: string
  serviceOrderSortOrder: 'asc' | 'desc'
  
  // Date range filters
  dateRangeStart?: string
  dateRangeEnd?: string
  
  // Customers filters
  customerSearch: string
  customerPage: number
  customerLimit: number
  
  // Products filters
  productSearch: string
  productPage: number
  productLimit: number
  productCategory?: string
}

interface FilterActions {
  // Service Orders
  setServiceOrderStatus: (status?: ServiceOrderStatus) => void
  setServiceOrderPriority: (priority?: ServiceOrderPriority) => void
  setServiceOrderSearch: (search: string) => void
  setServiceOrderPage: (page: number) => void
  setServiceOrderSort: (sortBy: string, order: 'asc' | 'desc') => void
  
  // Date Range
  setDateRange: (start?: string, end?: string) => void
  
  // Customers
  setCustomerSearch: (search: string) => void
  setCustomerPage: (page: number) => void
  
  // Products
  setProductSearch: (search: string) => void
  setProductPage: (page: number) => void
  setProductCategory: (category?: string) => void
  
  // Reset
  resetFilters: () => void
}

const initialState: FilterState = {
  serviceOrderSearch: '',
  serviceOrderPage: 1,
  serviceOrderLimit: 10,
  serviceOrderSortBy: 'createdAt',
  serviceOrderSortOrder: 'desc',
  customerSearch: '',
  customerPage: 1,
  customerLimit: 10,
  productSearch: '',
  productPage: 1,
  productLimit: 10,
}

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  ...initialState,
  
  setServiceOrderStatus: (status) => set({ serviceOrderStatus: status }),
  setServiceOrderPriority: (priority) => set({ serviceOrderPriority: priority }),
  setServiceOrderSearch: (search) => set({ serviceOrderSearch: search, serviceOrderPage: 1 }),
  setServiceOrderPage: (page) => set({ serviceOrderPage: page }),
  setServiceOrderSort: (sortBy, order) => set({ serviceOrderSortBy: sortBy, serviceOrderSortOrder: order }),
  
  setDateRange: (start, end) => set({ dateRangeStart: start, dateRangeEnd: end }),
  
  setCustomerSearch: (search) => set({ customerSearch: search, customerPage: 1 }),
  setCustomerPage: (page) => set({ customerPage: page }),
  
  setProductSearch: (search) => set({ productSearch: search, productPage: 1 }),
  setProductPage: (page) => set({ productPage: page }),
  setProductCategory: (category) => set({ productCategory: category }),
  
  resetFilters: () => set(initialState),
}))
