import { useEffect } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { useGetReferencesStatuses } from '../api/reference-data/reference-data'
import { useGetUsers } from '../api/users/users'
import {
  usePatchServiceStatusServiceStatusId,
  usePostServiceStatus,
} from '../api/service-status/service-status'
import type { ServiceStatuses } from '../api/model'
import { humanize } from '../lib/format'
import { sortStatuses } from '../lib/statuses'
import { STAFF_ROLE_ID } from '../lib/config'
import { apiErrorMessage } from '../lib/api/errors'
import { invalidateOrderQueries } from '../lib/queries'
import { useAuth } from '../lib/auth/useAuth'
import { useUIStore } from '../store/uiStore'

const statusSchema = z.object({
  statusId: z.string().min(1, 'Choose a status'),
  assignedTo: z.string().min(1, 'Choose who is responsible'),
  comment: z.string().max(2000),
  notifyCustomer: z.boolean(),
})
type StatusForm = z.infer<typeof statusSchema>

interface StatusDialogProps {
  open: boolean
  serviceOrderId: string
  /** When set, the dialog edits this entry instead of adding a new one. */
  entry?: ServiceStatuses | null
  onClose: () => void
}

/** Add a status update to an order, or edit an existing timeline entry. */
export const StatusDialog = ({ open, serviceOrderId, entry, onClose }: StatusDialogProps) => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)
  const { user } = useAuth()
  const { data: statuses = [] } = useGetReferencesStatuses({ query: { enabled: open } })
  const { data: staff } = useGetUsers(
    { roleId: STAFF_ROLE_ID, limit: 100 },
    { query: { enabled: open } },
  )
  const create = usePostServiceStatus()
  const update = usePatchServiceStatusServiceStatusId()
  const mutation = entry ? update : create

  const { control, register, handleSubmit, reset, formState } = useForm<StatusForm>({
    resolver: zodResolver(statusSchema),
    defaultValues: { statusId: '', assignedTo: '', comment: '', notifyCustomer: false },
  })

  // Re-fill the form every time it opens (add = blank, edit = the entry)
  useEffect(() => {
    if (!open) return
    reset({
      statusId: entry?.statusId ?? '',
      assignedTo: entry?.assignedTo ?? user?.userId ?? '',
      comment: entry?.comment ?? '',
      notifyCustomer: entry?.notifyCustomer ?? false,
    })
    create.reset()
    update.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when opened/target changes
  }, [open, entry, user?.userId, reset])

  const onSubmit = async (data: StatusForm) => {
    try {
      if (entry?.serviceStatusId) {
        await update.mutateAsync({
          serviceStatusId: entry.serviceStatusId,
          data: {
            statusId: data.statusId,
            assignedTo: data.assignedTo,
            comment: data.comment.trim() || null,
            notifyCustomer: data.notifyCustomer,
          },
        })
      } else {
        await create.mutateAsync({
          data: {
            serviceOrderId,
            statusId: data.statusId,
            assignedTo: data.assignedTo,
            comment: data.comment.trim() || undefined,
            notifyCustomer: data.notifyCustomer,
          },
        })
      }
      await invalidateOrderQueries(queryClient)
      addNotification(entry ? 'Status entry updated' : 'Status updated', 'success')
      onClose()
    } catch {
      // shown inline from mutation.error
    }
  }

  const staffUsers = staff?.data ?? []

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{entry ? 'Edit status entry' : 'Update status'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {mutation.isError && (
              <Alert severity="error">
                {apiErrorMessage(mutation.error, 'Could not save the status')}
              </Alert>
            )}
            <Controller
              name="statusId"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                >
                  {sortStatuses(statuses).map((status) => (
                    <MenuItem key={status.statusId} value={status.statusId}>
                      {humanize(status.statusName)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="assignedTo"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Assigned to"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                >
                  {staffUsers.map((member) => (
                    <MenuItem key={member.userId} value={member.userId}>
                      {member.userName}
                    </MenuItem>
                  ))}
                  {/* Keep an assignee that is not in the staff list selectable */}
                  {field.value && !staffUsers.some((member) => member.userId === field.value) && (
                    <MenuItem value={field.value}>
                      {entry?.assignedToName ?? user?.userName ?? 'Current user'}
                    </MenuItem>
                  )}
                </TextField>
              )}
            />
            <TextField
              label="Comment"
              multiline
              minRows={3}
              fullWidth
              {...register('comment')}
              error={!!formState.errors.comment}
              helperText={formState.errors.comment?.message}
            />
            <Controller
              name="notifyCustomer"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                  }
                  label="Notify customer"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
