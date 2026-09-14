import { Alert, Typography } from '@mui/material'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { deleteUsersUserId } from '../api/users/users'
import type { Users } from '../api/model'
import { apiErrorMessage } from '../lib/api/errors'
import { invalidateCustomerQueries } from '../lib/queries'
import { useUIStore } from '../store/uiStore'
import { ConfirmDialog } from './ConfirmDialog'

interface DeleteCustomerDialogProps {
  customer: Users | null
  onClose: () => void
  onDeleted?: () => void
}

/** Typed confirmation, because deleting a customer also deletes their devices and orders. */
export const DeleteCustomerDialog = ({
  customer,
  onClose,
  onDeleted,
}: DeleteCustomerDialogProps) => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)
  const [deleting, setDeleting] = useState(false)

  const confirm = async () => {
    if (!customer?.userId) return
    setDeleting(true)
    try {
      await deleteUsersUserId(customer.userId)
      addNotification(`Deleted ${customer.userName}`, 'success')
      // Leave the (now deleted) customer's page before refetching, so it never flashes "not found"
      onDeleted?.()
      onClose()
      await invalidateCustomerQueries(queryClient)
    } catch (error) {
      addNotification(apiErrorMessage(error, 'Could not delete the customer'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={!!customer}
      title="Delete customer?"
      confirmLabel="Delete customer"
      destructive
      requireText={customer?.userName}
      isLoading={deleting}
      onConfirm={confirm}
      onClose={onClose}
    >
      <Alert severity="warning">
        This permanently deletes <strong>{customer?.userName}</strong> together with all their
        contact numbers, registered devices, <strong>service orders</strong> and status history.
      </Alert>
      <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
        This cannot be undone.
      </Typography>
    </ConfirmDialog>
  )
}
