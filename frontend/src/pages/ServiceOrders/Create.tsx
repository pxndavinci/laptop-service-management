import React, { useEffect } from 'react'
import { Box, Typography, Container, Button } from '@mui/material'
import BackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { ServiceOrderForm } from '../../components/ServiceOrderForm'
import { useCreateServiceOrder } from '../../lib/hooks/useServiceOrders'
import { useCreateCustomer } from '../../lib/hooks/useCustomers'
import { ServiceOrderFormData } from '../../lib/schemas/serviceOrderSchema'
import { useUIStore } from '../../store/uiStore'
import { useDraftStore } from '../../store/draftStore'

const CreateServiceOrder: React.FC = () => {
  const navigate = useNavigate()
  const createMutation = useCreateServiceOrder()
  const createCustomerMutation = useCreateCustomer()
  const addNotification = useUIStore((state) => state.addNotification)
  const clearOldDrafts = useDraftStore((state) => state.clearOldDrafts)

  // Clear old drafts on mount
  useEffect(() => {
    clearOldDrafts()
  }, [clearOldDrafts])

  const handleSubmit = async (data: ServiceOrderFormData) => {
    try {
      let customerId = data.customerId

      if (!customerId) {
        const customer = await createCustomerMutation.mutateAsync({
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail,
          address: data.customerAddress,
          city: data.customerCity,
          zipCode: data.customerZipCode,
        })
        customerId = customer.id
      }

      const result = await createMutation.mutateAsync({
        customerId,
        productId: data.productId,
        description: data.description,
        status: data.status,
        priority: data.priority,
        estimatedCompletionDate: data.estimatedCompletionDate,
        totalCost: data.totalCost,
        notes: data.notes,
      })
      
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
            onClick={() => navigate('/')}
            variant="text"
          >
            Dashboard
          </Button>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            New Service Order
          </Typography>
        </Box>

        {/* Form */}
        <ServiceOrderForm
          isNew={true}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || createCustomerMutation.isPending}
        />
      </Box>
    </Container>
  )
}

export default CreateServiceOrder
