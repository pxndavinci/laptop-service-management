export interface ServiceOrderComposerSearchParams {
  userName?: string
  contactNumber?: string
  email?: string
  productName?: string
  brandName?: string
  productTypeName?: string
  serialNumber?: string
  limit?: number
}

export interface ComposerUser {
  userId: string
  userName: string
  email: string
  address?: string
  roleId: number
}

export interface ComposerContact {
  contactId: string
  contactNumber: string
}

export interface ComposerBrand {
  brandId: string
  brandName: string
}

export interface ComposerProductType {
  productTypeId: string
  productTypeName: string
}

export interface ComposerProduct {
  productId: string
  productName: string
  description?: string
  brand: ComposerBrand
  productType: ComposerProductType
}

export interface ComposerUserProduct {
  userProductId: string
  serialNumber: string
  loginPassword?: string
  additionalInfo?: string
}

export interface ServiceOrderComposerSearchResult {
  user: ComposerUser
  contacts: ComposerContact[]
  product?: ComposerProduct
  userProduct?: ComposerUserProduct
}

export interface ExistingEntityReferences {
  userId: string | null
  contactId: string | null
  brandId: string | null
  productTypeId: string | null
  productId: string | null
  userProductId: string | null
}

export interface ComposeCustomerInput {
  userName: string
  roleId: number
  email?: string
  address?: string
}

export interface ComposeContactInput {
  contactNumber: string
}

export interface ComposeProductInput {
  productName: string
  description?: string
  brandName: string
  productTypeName: string
}

export interface ComposeUserProductInput {
  serialNumber: string
  loginPassword?: string
  additionalInfo?: string
}

export interface ComposeServiceOrderInput {
  estimatedPrice?: number
  estimatedCompletionDate?: string
  priorityLevel: number
  issueDescription: 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'OTHER'
  issueNotes?: string
  entryByUserId: string
}

export interface ComposeServiceOrderRequest {
  existing: ExistingEntityReferences
  customer: ComposeCustomerInput
  contact: ComposeContactInput
  product: ComposeProductInput
  userProduct: ComposeUserProductInput
  serviceOrder: ComposeServiceOrderInput
}

export interface CreatedEntitiesSummary {
  userCreated: boolean
  contactCreated: boolean
  brandCreated: boolean
  productTypeCreated: boolean
  productCreated: boolean
  userProductCreated: boolean
}

export interface ComposeServiceOrderResponse {
  serviceOrder: any
  createdEntities: CreatedEntitiesSummary
}
