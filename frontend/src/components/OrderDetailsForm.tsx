import { Alert, Box, Button, Grid, InputAdornment, MenuItem, Stack, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { usePatchServiceOrdersServiceOrderId } from '../api/service-orders/service-orders'
import type { ServiceOrders } from '../api/model'
import { humanize, toDateTimeLocal } from '../lib/format'
import { apiErrorMessage } from '../lib/api/errors'
import { invalidateOrderQueries } from '../lib/queries'
import { useUIStore } from '../store/uiStore'

const PAYMENT_METHODS = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'ONLINE_PAYMENT', 'OTHER'] as const
const PAYMENT_STATUSES = ['PENDING', 'PARTIAL', 'COMPLETED', 'REFUNDED'] as const
const ISSUE_TYPES = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'OTHER'] as const

/** Empty = no price; otherwise a number of 0 or more. */
const price = z
  .string()
  .trim()
  .refine((value) => value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0), {
    message: 'Enter a price of 0 or more',
  })

const orderDetailsSchema = z.object({
  estimatedPrice: price,
  finalPrice: price,
  paymentMethod: z.union([z.enum(PAYMENT_METHODS), z.literal('')]),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  priorityLevel: z.number().int().min(1).max(5),
  estimatedCompletionDate: z.string(),
  actualCompletionDate: z.string(),
  issueDescription: z.enum(ISSUE_TYPES),
  issueNotes: z.string().max(5000),
})
type OrderDetailsForm = z.infer<typeof orderDetailsSchema>

const toForm = (order: ServiceOrders): OrderDetailsForm => ({
  estimatedPrice: order.estimatedPrice?.toString() ?? '',
  finalPrice: order.finalPrice?.toString() ?? '',
  paymentMethod: order.paymentMethod ?? '',
  paymentStatus: order.paymentStatus ?? 'PENDING',
  priorityLevel: order.priorityLevel ?? 3,
  estimatedCompletionDate: toDateTimeLocal(order.estimatedCompletionDate),
  actualCompletionDate: toDateTimeLocal(order.actualCompletionDate),
  issueDescription: order.issueDescription ?? 'OTHER',
  issueNotes: order.issueNotes ?? '',
})

const toNumberOrNull = (value: string) => (value.trim() === '' ? null : Number(value))
const toIsoOrNull = (value: string) => (value ? new Date(value).toISOString() : null)

interface OrderDetailsFormProps {
  order: ServiceOrders
  onDone: () => void
}

/** Edit mode of the "Order details" card. */
export const OrderDetailsEditor = ({ order, onDone }: OrderDetailsFormProps) => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)
  const patch = usePatchServiceOrdersServiceOrderId()

  const { control, register, handleSubmit, formState } = useForm<OrderDetailsForm>({
    resolver: zodResolver(orderDetailsSchema),
    defaultValues: toForm(order),
  })
  const { errors } = formState

  const onSubmit = async (data: OrderDetailsForm) => {
    try {
      await patch.mutateAsync({
        serviceOrderId: order.serviceOrderId!,
        data: {
          estimatedPrice: toNumberOrNull(data.estimatedPrice),
          finalPrice: toNumberOrNull(data.finalPrice),
          paymentMethod: data.paymentMethod || null,
          paymentStatus: data.paymentStatus,
          priorityLevel: data.priorityLevel,
          estimatedCompletionDate: toIsoOrNull(data.estimatedCompletionDate),
          actualCompletionDate: toIsoOrNull(data.actualCompletionDate),
          issueDescription: data.issueDescription,
          issueNotes: data.issueNotes.trim() || null,
        },
      })
      await invalidateOrderQueries(queryClient)
      addNotification('Order details saved', 'success')
      onDone()
    } catch {
      // shown inline from patch.error
    }
  }

  const rupee = { input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {patch.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiErrorMessage(patch.error, 'Could not save the order')}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Estimated price"
            fullWidth
            slotProps={{ ...rupee, htmlInput: { inputMode: 'decimal' } }}
            {...register('estimatedPrice')}
            error={!!errors.estimatedPrice}
            helperText={errors.estimatedPrice?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Final price"
            fullWidth
            slotProps={{ ...rupee, htmlInput: { inputMode: 'decimal' } }}
            {...register('finalPrice')}
            error={!!errors.finalPrice}
            helperText={errors.finalPrice?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="paymentStatus"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Payment status" fullWidth>
                {PAYMENT_STATUSES.map((value) => (
                  <MenuItem key={value} value={value}>
                    {humanize(value)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Payment method" fullWidth>
                <MenuItem value="">Not set</MenuItem>
                {PAYMENT_METHODS.map((value) => (
                  <MenuItem key={value} value={value}>
                    {humanize(value)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="issueDescription"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Issue type" fullWidth>
                {ISSUE_TYPES.map((value) => (
                  <MenuItem key={value} value={value}>
                    {humanize(value)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="priorityLevel"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Priority"
                fullWidth
                onChange={(event) => field.onChange(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <MenuItem key={level} value={level}>
                    P{level}
                    {level === 1 ? ' (highest)' : level === 5 ? ' (lowest)' : ''}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Estimated completion"
            type="datetime-local"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('estimatedCompletionDate')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Actual completion"
            type="datetime-local"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('actualCompletionDate')}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Issue notes"
            multiline
            minRows={3}
            fullWidth
            {...register('issueNotes')}
            error={!!errors.issueNotes}
            helperText={errors.issueNotes?.message}
          />
        </Grid>
      </Grid>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onDone} disabled={patch.isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={patch.isPending}>
          {patch.isPending ? 'Saving…' : 'Save'}
        </Button>
      </Stack>
    </Box>
  )
}
