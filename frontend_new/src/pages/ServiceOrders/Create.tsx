import React, { useEffect } from 'react'
import { Box, Typography, Container, Button } from '@mui/material'
import { ArrowBack as BackIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { ServiceOrderForm } from '../../components/ServiceOrderForm'
import { useCreateServiceOrder } from '../../lib/hooks/useServiceOrders'
import { ServiceOrderFormData } from '../../lib/schemas/serviceOrderSchema'
import { useUIStore } from '../../store/uiStore'
import { useDraftStore } from '../../store/draftStore'

const CreateServiceOrder: React.FC = () => {
  const navigate = useNavigate()
  const createMutation = useCreateServiceOrder()
  const addNotification = useUIStore((state) => state.addNotification)
  const clearOldDrafts = useDraftStore((state) => state.clearOldDrafts)

  // Clear old drafts on mount
  useEffect(() => {
    clearOldDrafts()
  }, [clearOldDrafts])

  const handleSubmit = async (data: ServiceOrderFormData) => {
    try {
      const result = await createMutation.mutateAsync(
        data as Omit<typeof data, 'orderNumber'>
      )
      
      // Remove draft after successful creation
      const draftStore = useDraftStore.getState()
      const drafts = draftStore.getDraftsForType('service-order')
      drafts.forEach((draft) => draftStore.removeDraft(draft.id))
      
      addNotification('Service order created successfully!', 'success')
      navigate(`/service-orders/${result.id}`)
    } catch (error) {
      addNotification('Failed to create service order', 'error')
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/service-orders')}
            variant="text"
          >
            Back
          </Button>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            Create Service Order
          </Typography>
        </Box>

        {/* Form */}
        <ServiceOrderForm
          isNew={true}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </Box>
    </Container>
  )
}

export default CreateServiceOrder
