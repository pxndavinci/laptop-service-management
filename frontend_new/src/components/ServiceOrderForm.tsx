import React, { useState } from 'react'
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { serviceOrderFormSchema, ServiceOrderFormData } from '../lib/schemas/serviceOrderSchema'
import { useDraftAutoSave, useLoadDraft } from '../lib/hooks/useDraftAutoSave'
import { useDraftStore } from '../store/draftStore'
import { useUIStore } from '../store/uiStore'

interface ServiceOrderFormProps {
  initialData?: Partial<ServiceOrderFormData>
  isNew?: boolean
  onSubmit: (data: ServiceOrderFormData) => Promise<void>
  isLoading?: boolean
}

const steps = ['Order Details', 'Description', 'Schedule & Cost', 'Review & Submit']

export const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  initialData,
  isNew = true,
  onSubmit,
  isLoading = false,
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [showRecovery, setShowRecovery] = useState(false)
  const addNotification = useUIStore((state) => state.addNotification)
  const draftId = `service-order-${initialData?.orderNumber || 'new'}-${Date.now()}`
  const { draftData, draftExists, removeDraft } = useLoadDraft(draftId, 'service-order')

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderFormSchema),
    defaultValues: draftData || initialData || {
      customerId: '',
      productId: '',
      description: '',
      status: 'draft',
      priority: 'medium',
      estimatedCompletionDate: '',
      totalCost: 0,
      notes: '',
    },
  })

  const formData = watch()
  useDraftAutoSave(formData, {
    draftId,
    draftType: 'service-order',
    debounceMs: 500,
  })

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    if (activeStep === steps.length - 1) {
      handleSubmit(onSubmit)()
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleRecovery = () => {
    reset(draftData as ServiceOrderFormData)
    setShowRecovery(false)
    addNotification('Draft recovered successfully', 'success')
  }

  const handleDiscardDraft = () => {
    removeDraft()
    setShowRecovery(false)
    reset()
    addNotification('Draft discarded', 'info')
  }

  return (
    <Box>
      {/* Recovery Alert */}
      {draftExists && showRecovery && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setShowRecovery(false)}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>You have an unsaved draft. Would you like to recover it?</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={handleRecovery} variant="contained">
                Recover
              </Button>
              <Button size="small" onClick={handleDiscardDraft} variant="outlined">
                Discard
              </Button>
            </Stack>
          </Box>
        </Alert>
      )}

      <Card>
        <CardContent>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleNext}>
            {/* Step 1: Order Details */}
            {activeStep === 0 && (
              <Stack spacing={2}>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Customer ID"
                      error={!!errors.customerId}
                      helperText={errors.customerId?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="productId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Product ID"
                      error={!!errors.productId}
                      helperText={errors.productId?.message}
                      fullWidth
                    />
                  )}
                />
              </Stack>
            )}

            {/* Step 2: Description */}
            {activeStep === 1 && (
              <Stack spacing={2}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      multiline
                      rows={6}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select {...field} label="Priority">
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            )}

            {/* Step 3: Schedule & Cost */}
            {activeStep === 2 && (
              <Stack spacing={2}>
                <Controller
                  name="estimatedCompletionDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Estimated Completion Date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.estimatedCompletionDate}
                      helperText={errors.estimatedCompletionDate?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="totalCost"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Total Cost"
                      InputProps={{ startAdornment: '$' }}
                      error={!!errors.totalCost}
                      helperText={errors.totalCost?.message}
                      fullWidth
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            )}

            {/* Step 4: Review */}
            {activeStep === 3 && (
              <Stack spacing={2}>
                <Typography variant="h6">Review Your Service Order</Typography>
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Customer ID
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formData.customerId}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Product ID
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formData.productId}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Priority
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formData.priority}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Total Cost
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          ${formData.totalCost}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Description
                      </Typography>
                      <Typography variant="body2">{formData.description}</Typography>
                    </Box>
                  </Stack>
                </Box>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Additional Notes (Optional)"
                      multiline
                      rows={3}
                      fullWidth
                    />
                  )}
                />
              </Stack>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 4 }} justifyContent="space-between">
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
              >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
