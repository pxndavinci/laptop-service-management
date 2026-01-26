import type {
  ServiceOrder,
  User,
  Product,
  Brand,
  ProductType,
  ServiceStatus,
} from "./types"

// Brands
export const brands: Brand[] = [
  { id: "b1", name: "Dell" },
  { id: "b2", name: "HP" },
  { id: "b3", name: "Lenovo" },
  { id: "b4", name: "Apple" },
  { id: "b5", name: "Asus" },
]

// Product Types
export const productTypes: ProductType[] = [
  { id: "pt1", name: "Laptop" },
  { id: "pt2", name: "Desktop" },
  { id: "pt3", name: "Tablet" },
]

// Users
export const users: User[] = [
  {
    id: "u1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1-555-0101",
    address: "123 Main St, New York, NY 10001",
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "u2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1-555-0102",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    createdAt: "2025-01-12T14:30:00Z",
  },
  {
    id: "u3",
    name: "Mike Wilson",
    email: "mike.wilson@email.com",
    phone: "+1-555-0103",
    address: "789 Pine Rd, Chicago, IL 60601",
    createdAt: "2025-01-15T09:15:00Z",
  },
  {
    id: "u4",
    name: "Emily Brown",
    email: "emily.b@email.com",
    phone: "+1-555-0104",
    address: "321 Elm St, Houston, TX 77001",
    createdAt: "2025-01-18T11:45:00Z",
  },
]

// Products
export const products: Product[] = [
  {
    id: "p1",
    name: "Inspiron 15",
    brand: brands[0],
    productType: productTypes[0],
    description: "15-inch laptop with Intel Core i7",
  },
  {
    id: "p2",
    name: "Pavilion x360",
    brand: brands[1],
    productType: productTypes[0],
    description: "Convertible 14-inch laptop",
  },
  {
    id: "p3",
    name: "ThinkPad X1 Carbon",
    brand: brands[2],
    productType: productTypes[0],
    description: "Business ultrabook",
  },
  {
    id: "p4",
    name: "MacBook Pro 14",
    brand: brands[3],
    productType: productTypes[0],
    description: "M3 Pro chip, 14-inch display",
  },
  {
    id: "p5",
    name: "ROG Zephyrus",
    brand: brands[4],
    productType: productTypes[0],
    description: "Gaming laptop with RTX 4080",
  },
]

// Service Orders
export const serviceOrders: ServiceOrder[] = [
  {
    id: "so1",
    tagNo: "2600001",
    userProduct: {
      id: "up1",
      user: users[0],
      product: products[0],
      serialNumber: "DELL-2024-001234",
      additionalInfo: "16GB RAM, 512GB SSD",
    },
    issueType: "HARDWARE",
    issueNotes: "Screen flickering when running high-resolution content. Customer reports issue started after recent Windows update.",
    status: "IN_PROGRESS",
    priorityLevel: 2,
    estimatedPrice: 250,
    paymentStatus: "PENDING",
    paymentMethod: "CREDIT_CARD",
    estimatedCompletionDate: "2026-01-28T17:00:00Z",
    timeline: [
      {
        id: "t1",
        status: "CREATED",
        timestamp: "2026-01-20T09:00:00Z",
        note: "Service order created",
        updatedBy: "Admin",
      },
      {
        id: "t2",
        status: "RECEIVED",
        timestamp: "2026-01-20T10:30:00Z",
        note: "Device received at service center",
        updatedBy: "Tech Support",
      },
      {
        id: "t3",
        status: "IN_PROGRESS",
        timestamp: "2026-01-21T14:00:00Z",
        note: "Diagnosis complete. Display cable needs replacement.",
        updatedBy: "John Tech",
      },
    ],
    createdAt: "2026-01-20T09:00:00Z",
    updatedAt: "2026-01-21T14:00:00Z",
  },
  {
    id: "so2",
    tagNo: "2600002",
    userProduct: {
      id: "up2",
      user: users[1],
      product: products[3],
      serialNumber: "APPLE-2024-MAC789",
      additionalInfo: "M3 Pro, 18GB RAM, 512GB SSD",
    },
    issueType: "SOFTWARE",
    issueNotes: "System crashes randomly. Kernel panic errors in console.",
    status: "COMPLETED",
    priorityLevel: 1,
    estimatedPrice: 150,
    finalPrice: 120,
    paymentStatus: "COMPLETED",
    paymentMethod: "ONLINE_PAYMENT",
    estimatedCompletionDate: "2026-01-25T17:00:00Z",
    actualCompletionDate: "2026-01-24T16:00:00Z",
    timeline: [
      {
        id: "t4",
        status: "CREATED",
        timestamp: "2026-01-18T11:00:00Z",
        note: "Service order created - High priority",
        updatedBy: "Admin",
      },
      {
        id: "t5",
        status: "RECEIVED",
        timestamp: "2026-01-18T13:00:00Z",
        note: "Device received",
        updatedBy: "Reception",
      },
      {
        id: "t6",
        status: "IN_PROGRESS",
        timestamp: "2026-01-19T09:00:00Z",
        note: "Running diagnostics",
        updatedBy: "Mac Specialist",
      },
      {
        id: "t7",
        status: "COMPLETED",
        timestamp: "2026-01-24T16:00:00Z",
        note: "macOS reinstalled. All diagnostics passed.",
        updatedBy: "Mac Specialist",
      },
    ],
    createdAt: "2026-01-18T11:00:00Z",
    updatedAt: "2026-01-24T16:00:00Z",
  },
  {
    id: "so3",
    tagNo: "2600003",
    userProduct: {
      id: "up3",
      user: users[2],
      product: products[2],
      serialNumber: "LENOVO-2024-TH456",
      additionalInfo: "Intel Core i7-1365U, 32GB RAM",
    },
    issueType: "NETWORK",
    issueNotes: "WiFi disconnects frequently. Bluetooth also not working properly.",
    status: "RECEIVED",
    priorityLevel: 3,
    estimatedPrice: 80,
    paymentStatus: "PENDING",
    timeline: [
      {
        id: "t8",
        status: "CREATED",
        timestamp: "2026-01-24T14:00:00Z",
        note: "Service order created",
        updatedBy: "Admin",
      },
      {
        id: "t9",
        status: "RECEIVED",
        timestamp: "2026-01-25T10:00:00Z",
        note: "Device received. Initial inspection complete.",
        updatedBy: "Tech Support",
      },
    ],
    createdAt: "2026-01-24T14:00:00Z",
    updatedAt: "2026-01-25T10:00:00Z",
  },
  {
    id: "so4",
    tagNo: "2600004",
    userProduct: {
      id: "up4",
      user: users[3],
      product: products[4],
      serialNumber: "ASUS-2024-ROG999",
      additionalInfo: "RTX 4080, 32GB RAM, 1TB SSD",
    },
    issueType: "HARDWARE",
    issueNotes: "Overheating during gaming. Thermal throttling detected.",
    status: "CREATED",
    priorityLevel: 2,
    estimatedPrice: 200,
    paymentStatus: "PENDING",
    timeline: [
      {
        id: "t10",
        status: "CREATED",
        timestamp: "2026-01-26T09:30:00Z",
        note: "Service order created. Customer to drop off device.",
        updatedBy: "Admin",
      },
    ],
    createdAt: "2026-01-26T09:30:00Z",
    updatedAt: "2026-01-26T09:30:00Z",
  },
  {
    id: "so5",
    tagNo: "2600005",
    userProduct: {
      id: "up5",
      user: users[0],
      product: products[1],
      serialNumber: "HP-2024-PAV321",
      additionalInfo: "Intel Core i5, 16GB RAM",
    },
    issueType: "OTHER",
    issueNotes: "Battery not charging. Power adapter tested and working fine.",
    status: "DELIVERED",
    priorityLevel: 4,
    estimatedPrice: 180,
    finalPrice: 175,
    paymentStatus: "COMPLETED",
    paymentMethod: "CASH",
    estimatedCompletionDate: "2026-01-22T17:00:00Z",
    actualCompletionDate: "2026-01-21T15:00:00Z",
    timeline: [
      {
        id: "t11",
        status: "CREATED",
        timestamp: "2026-01-15T10:00:00Z",
        note: "Service order created",
        updatedBy: "Admin",
      },
      {
        id: "t12",
        status: "RECEIVED",
        timestamp: "2026-01-15T14:00:00Z",
        note: "Device received",
        updatedBy: "Reception",
      },
      {
        id: "t13",
        status: "IN_PROGRESS",
        timestamp: "2026-01-16T09:00:00Z",
        note: "Battery replacement required",
        updatedBy: "Tech Support",
      },
      {
        id: "t14",
        status: "COMPLETED",
        timestamp: "2026-01-21T15:00:00Z",
        note: "New battery installed. Device tested successfully.",
        updatedBy: "Tech Support",
      },
      {
        id: "t15",
        status: "DELIVERED",
        timestamp: "2026-01-22T11:00:00Z",
        note: "Device delivered to customer",
        updatedBy: "Reception",
      },
    ],
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-22T11:00:00Z",
  },
]

// Status options for reference
export const statusOptions: ServiceStatus[] = [
  "CREATED",
  "RECEIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "DELIVERED",
  "CANCELLED",
]

// Helper function to get status color
export function getStatusColor(status: ServiceStatus): string {
  const colors: Record<ServiceStatus, string> = {
    CREATED: "bg-slate-100 text-slate-700",
    RECEIVED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  }
  return colors[status]
}

// Helper function to get priority label
export function getPriorityLabel(level: number): string {
  const labels: Record<number, string> = {
    1: "Critical",
    2: "High",
    3: "Medium",
    4: "Low",
    5: "Lowest",
  }
  return labels[level] || "Unknown"
}

export function getPriorityColor(level: number): string {
  const colors: Record<number, string> = {
    1: "bg-red-100 text-red-700",
    2: "bg-orange-100 text-orange-700",
    3: "bg-yellow-100 text-yellow-700",
    4: "bg-blue-100 text-blue-700",
    5: "bg-slate-100 text-slate-700",
  }
  return colors[level] || "bg-slate-100 text-slate-700"
}
