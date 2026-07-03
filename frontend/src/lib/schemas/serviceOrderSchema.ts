import { z } from 'zod'

export const serviceOrderFormSchema = z.object({
  userName: z.string().min(1, 'Customer name is required'),
  roleId: z.number().default(1),
  contactNumber: z.string().min(1, 'Mobile number is required').regex(/^[0-9+]+$/, "Only numbers and '+' are allowed"),
  email: z.union([z.string().email('Enter a valid email address'), z.literal('')]).default(''),
  address: z.string().optional().default(''),

  productName: z.string().min(1, 'Product is required'),
  description: z.string().optional().default(''),
  brandName: z.string().min(1, 'Brand must be selected'),
  productTypeName: z.string().min(1, 'Product type must be selected'),
  serialNumber: z.string().min(1, 'Serial number should be entered'),
  loginPassword: z.string().optional().default(''),
  additionalInfo: z.string().optional().default(''),

  estimatedPrice: z.number().default(0),
  estimatedCompletionDate: z.string().default(new Date().toISOString()),
  priorityLevel: z.enum(['1', '2', '3', '4', '5']).default('3'),
  issueDescription: z.enum(['Hardware', 'Software', 'Network', 'Other']).default('Hardware'),
  issueNotes: z.string().optional().default(''),
  entryByUserId: z.string().min(1, 'Entry user is required'),
})

export type ServiceOrderFormData = z.infer<typeof serviceOrderFormSchema>
