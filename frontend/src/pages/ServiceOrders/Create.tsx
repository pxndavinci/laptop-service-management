import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ServiceOrderForm } from '../../components/ServiceOrderForm'
import { ServiceOrderFormData } from '../../lib/schemas/serviceOrderSchema'
import { useUIStore } from '../../store/uiStore'
import { useDraftStore } from '../../store/draftStore'
import { usePostServiceOrderComposerSubmit } from '../../api/service-orders/service-orders'
import type { ComposeServiceOrderRequest, ComposeServiceOrderInputIssueDescription } from '../../api/model'

const CreateServiceOrder: React.FC = () => {
  const navigate = useNavigate()
  const createMutation = usePostServiceOrderComposerSubmit()
  const addNotification = useUIStore((state) => state.addNotification)

  const handleSubmit = async (data: ServiceOrderFormData) => {
    try {
      const issueMap: Record<string, ComposeServiceOrderInputIssueDescription> = {
        Hardware: 'HARDWARE',
        Software: 'SOFTWARE',
        Network: 'NETWORK',
        Other: 'OTHER',
      }

      const request: ComposeServiceOrderRequest = {
        existing: {},
        customer: {
          userName: data.userName,
          roleId: Number(data.roleId || 1),
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
          loginPassword: data.loginPassword || null,
          additionalInfo: data.additionalInfo || null,
        },
        serviceOrder: {
          estimatedPrice: Number(data.estimatedPrice) || 0,
          estimatedCompletionDate: data.estimatedCompletionDate || undefined,
          priorityLevel: Number(data.priorityLevel),
          issueDescription: issueMap[data.issueDescription] ?? 'HARDWARE',
          issueNotes: data.issueNotes || undefined,
          entryByUserId: data.entryByUserId,
        },
      }

      const result = await createMutation.mutateAsync({ data: request })

      const draftStore = useDraftStore.getState()
      const drafts = draftStore.getDraftsForType('service-order')
      drafts.forEach((draft) => draftStore.removeDraft(draft.id))

      addNotification('Service order created successfully!', 'success')
      const serviceOrderId = result.status === 201 ? result.data?.serviceOrder?.serviceOrderId : undefined
      if (serviceOrderId) {
        navigate(`/service-orders/${serviceOrderId}`)
      } else {
        navigate('/service-orders')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create service order'
      addNotification(message, 'error')
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            New Service Order
          </Typography>
        </Box>

        <ServiceOrderForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </Box>
    </Container>
  )
}

export default CreateServiceOrder
