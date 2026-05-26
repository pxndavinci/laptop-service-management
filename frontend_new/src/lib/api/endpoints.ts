// Service Order Endpoints
export const ENDPOINTS = {
  // Service Orders
  serviceOrders: {
    list: '/service-orders',
    create: '/service-orders',
    detail: (id: string) => `/service-orders/${id}`,
    update: (id: string) => `/service-orders/${id}`,
    delete: (id: string) => `/service-orders/${id}`,
  },
  
  // Customers
  customers: {
    list: '/customers',
    create: '/customers',
    detail: (id: string) => `/customers/${id}`,
    update: (id: string) => `/customers/${id}`,
    delete: (id: string) => `/customers/${id}`,
  },
  
  // Products
  products: {
    list: '/products',
    create: '/products',
    detail: (id: string) => `/products/${id}`,
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  
  // Reports
  reports: {
    serviceCompletion: '/reports/service-completion',
    productUsage: '/reports/product-usage',
    revenue: '/reports/revenue',
  },
  
  // Dashboard
  dashboard: {
    metrics: '/dashboard/metrics',
    recentOrders: '/dashboard/recent-orders',
    trendData: '/dashboard/trend-data',
  },
}
