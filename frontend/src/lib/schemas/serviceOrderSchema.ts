import { z } from 'zod'

export const serviceOrderFormSchema = z.object({
  // Customer
  userName: z.string().min(1, 'Customer name is required'),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .regex(/^[0-9+]+$/, "Only numbers and '+' are allowed"),
  email: z.union([z.string().email('Enter a valid email address'), z.literal('')]),
  address: z.string(),

  // Device
  productName: z.string().min(1, 'Product name is required'),
  brandName: z.string().min(1, 'Brand is required'),
  productTypeName: z.string().min(1, 'Product type is required'),
  description: z.string(),
  serialNumber: z.string().min(1, 'Serial number is required'),
  loginPassword: z.string(),
  additionalInfo: z.string(),

  // Order
  estimatedPrice: z.number().min(0, 'Price cannot be negative'),
  estimatedCompletionDate: z.string().min(1, 'Estimated completion is required'),
  priorityLevel: z.number().int().min(1).max(5),
  issueDescription: z.enum(['HARDWARE', 'SOFTWARE', 'NETWORK', 'OTHER']),
  issueNotes: z.string(),
})

export type ServiceOrderFormData = z.infer<typeof serviceOrderFormSchema>
