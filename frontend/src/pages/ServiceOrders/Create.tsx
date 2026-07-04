import { Box, Container, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { ServiceOrderForm, ExistingLinks } from '../../components/ServiceOrderForm'
import { ServiceOrderFormData } from '../../lib/schemas/serviceOrderSchema'
import { useUIStore } from '../../store/uiStore'
import { usePostServiceOrderComposerSubmit } from '../../api/service-orders/service-orders'
import type { ComposeServiceOrderRequest } from '../../api/model'
import { CUSTOMER_ROLE_ID, ENTRY_USER_ID } from '../../lib/config'

const toRequest = (data: ServiceOrderFormData, links: ExistingLinks): ComposeServiceOrderRequest => ({
  existing: {
    userId: links.userId ?? null,
    contactId: links.contactId ?? null,
    brandId: links.brandId ?? null,
    productTypeId: links.productTypeId ?? null,
    productId: links.productId ?? null,
    userProductId: links.userProductId ?? null,
  },
  customer: {
    userName: data.userName,
    roleId: CUSTOMER_ROLE_ID,
    email: data.email || undefined,
    address: data.address || undefined,
  },
  contact: {
    contactNumber: data.contactNumber,
  },
  product: {
    productName: data.productName,
    description: data.description || undefined,
    brandName: data.brandName,
    productTypeName: data.productTypeName,
  },
  userProduct: {
    serialNumber: data.serialNumber,
    loginPassword: data.loginPassword || undefined,
    additionalInfo: data.additionalInfo || undefined,
  },
  serviceOrder: {
    estimatedPrice: data.estimatedPrice,
    estimatedCompletionDate: new Date(data.estimatedCompletionDate).toISOString(),
    priorityLevel: data.priorityLevel,
    issueDescription: data.issueDescription,
    issueNotes: data.issueNotes || undefined,
    entryByUserId: ENTRY_USER_ID,
  },
})

const CreateServiceOrder = () => {
  const navigate = useNavigate()
  const submitMutation = usePostServiceOrderComposerSubmit()
  const addNotification = useUIStore((state) => state.addNotification)

  const handleSubmit = async (data: ServiceOrderFormData, links: ExistingLinks) => {
    try {
      const result = await submitMutation.mutateAsync({ data: toRequest(data, links) })
      addNotification(`Service order #${result.serviceOrder?.tagNo ?? ''} created`, 'success')
      navigate('/service-orders')
    } catch (error) {
      const message =
        (isAxiosError(error) && error.response?.data?.error) || 'Failed to create service order'
      addNotification(message, 'error')
      throw error // keeps the form filled so the operator can correct and retry
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 4 }}>
          New Service Order
        </Typography>
        <ServiceOrderForm onSubmit={handleSubmit} isLoading={submitMutation.isPending} />
      </Box>
    </Container>
  )
}

export default CreateServiceOrder
