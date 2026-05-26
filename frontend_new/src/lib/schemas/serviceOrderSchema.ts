import { z } from 'zod'

export const serviceOrderFormSchema = z.object({
  orderNumber: z.string().optional(),
  customerId: z.string().min(1, 'Customer is required'),
  productId: z.string().min(1, 'Product is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  status: z.enum(['draft', 'pending', 'in-progress', 'completed', 'cancelled']).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimatedCompletionDate: z.string().min(1, 'Estimated completion date is required'),
  totalCost: z.number().min(0, 'Cost must be positive'),
  notes: z.string().optional().default(''),
})

export type ServiceOrderFormData = z.infer<typeof serviceOrderFormSchema>
