import { ReactNode } from 'react'
import {
  Checkbox,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { ServiceOrders } from '../api/model'
import { formatDate, formatPrice, humanize } from '../lib/format'
import { StatusChip } from './StatusChip'
import { PRIORITY_COLORS } from '../lib/statuses'

export type OrderColumn =
  | 'tag'
  | 'customer'
  | 'contact'
  | 'device'
  | 'issue'
  | 'priority'
  | 'status'
  | 'estimatedPrice'
  | 'created'

const ALL_ORDER_COLUMNS: OrderColumn[] = [
  'tag',
  'customer',
  'contact',
  'device',
  'issue',
  'priority',
  'status',
  'estimatedPrice',
  'created',
]

const HEADERS: Record<OrderColumn, { label: string; align?: 'right' }> = {
  tag: { label: 'Tag #' },
  customer: { label: 'Customer' },
  contact: { label: 'Contact' },
  device: { label: 'Device' },
  issue: { label: 'Issue' },
  priority: { label: 'Priority' },
  status: { label: 'Status' },
  estimatedPrice: { label: 'Est. price', align: 'right' },
  created: { label: 'Created' },
}

const renderCell = (column: OrderColumn, order: ServiceOrders): ReactNode => {
  switch (column) {
    case 'tag':
      return <Typography sx={{ fontWeight: 600 }}>{order.tagNo}</Typography>
    case 'customer':
      return order.userName
    case 'contact':
      return order.contactNumber ?? '—'
    case 'device':
      return (
        <>
          <Typography variant="body2">
            {[order.brandName, order.productName].filter(Boolean).join(' ')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {order.serialNumber}
          </Typography>
        </>
      )
    case 'issue':
      return <Chip label={humanize(order.issueDescription)} size="small" variant="outlined" />
    case 'priority':
      return (
        <Chip
          label={`P${order.priorityLevel}`}
          size="small"
          color={PRIORITY_COLORS[order.priorityLevel ?? 3] ?? 'default'}
        />
      )
    case 'status':
      return <StatusChip status={order.currentStatus} />
    case 'estimatedPrice':
      return formatPrice(order.estimatedPrice)
    case 'created':
      return formatDate(order.createdAt)
  }
}

export interface ExtraColumn {
  key: string
  label: string
  align?: 'right'
  render: (order: ServiceOrders) => ReactNode
}

interface ServiceOrdersTableProps {
  orders: ServiceOrders[]
  isLoading?: boolean
  columns?: OrderColumn[]
  /** Page-specific columns appended after the standard ones. */
  extraColumns?: ExtraColumn[]
  emptyText?: string
  /** Enables the checkbox column. Selection is by serviceOrderId. */
  selection?: {
    selected: Set<string>
    onChange: (next: Set<string>) => void
  }
  size?: 'small' | 'medium'
}

/**
 * Service order rows shared by the orders list, dashboard and customer page.
 * Clicking a row opens the order; clicking its checkbox only toggles selection.
 */
export const ServiceOrdersTable = ({
  orders,
  isLoading = false,
  columns = ALL_ORDER_COLUMNS,
  extraColumns = [],
  emptyText = 'No service orders found',
  selection,
  size = 'medium',
}: ServiceOrdersTableProps) => {
  const navigate = useNavigate()
  const colSpan = columns.length + extraColumns.length + (selection ? 1 : 0)

  const pageIds = orders.map((order) => order.serviceOrderId).filter((id): id is string => !!id)
  const selectedOnPage = selection ? pageIds.filter((id) => selection.selected.has(id)).length : 0

  const toggle = (id: string) => {
    if (!selection) return
    const next = new Set(selection.selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selection.onChange(next)
  }

  const toggleAll = () => {
    if (!selection) return
    const next = new Set(selection.selected)
    const allSelected = selectedOnPage === pageIds.length
    pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)))
    selection.onChange(next)
  }

  return (
    <TableContainer>
      <Table size={size}>
        <TableHead>
          <TableRow>
            {selection && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedOnPage > 0 && selectedOnPage < pageIds.length}
                  checked={pageIds.length > 0 && selectedOnPage === pageIds.length}
                  onChange={toggleAll}
                  disabled={pageIds.length === 0}
                  slotProps={{ input: { 'aria-label': 'Select all orders on this page' } }}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell key={column} align={HEADERS[column].align} sx={{ fontWeight: 600 }}>
                {HEADERS[column].label}
              </TableCell>
            ))}
            {extraColumns.map((column) => (
              <TableCell key={column.key} align={column.align} sx={{ fontWeight: 600 }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
                Loading…
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const id = order.serviceOrderId ?? ''
              const isSelected = !!selection?.selected.has(id)
              return (
                <TableRow
                  key={id}
                  hover
                  selected={isSelected}
                  onClick={() => navigate(`/service-orders/${id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  {selection && (
                    <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggle(id)}
                        slotProps={{ input: { 'aria-label': `Select order ${order.tagNo}` } }}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column} align={HEADERS[column].align}>
                      {renderCell(column, order)}
                    </TableCell>
                  ))}
                  {extraColumns.map((column) => (
                    <TableCell key={column.key} align={column.align}>
                      {column.render(order)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
