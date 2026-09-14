import { ReactNode } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import InboxIcon from '@mui/icons-material/MoveToInbox'
import BuildIcon from '@mui/icons-material/Build'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import WarningIcon from '@mui/icons-material/WarningAmber'
import { Link } from 'react-router-dom'
import { useGetDashboardMetrics } from '../../api/dashboard/dashboard'
import { useGetServiceOrders } from '../../api/service-orders/service-orders'
import { ServiceOrdersTable } from '../../components/ServiceOrdersTable'
import { StatusChip } from '../../components/StatusChip'
import { daysSince, formatDate } from '../../lib/format'

/** Orders whose repair finished at least this many days ago but are not collected. */
const PICKUP_ALERT_DAYS = 2

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

interface MetricCardProps {
  title: string
  value: number | undefined
  icon: ReactNode
  loading: boolean
  tone?: 'default' | 'warning'
  footer?: ReactNode
}

const MetricCard = ({ title, value, icon, loading, tone = 'default', footer }: MetricCardProps) => {
  const warn = tone === 'warning' && !!value
  return (
    <Card
      sx={{
        height: '100%',
        borderColor: warn ? 'warning.main' : undefined,
        bgcolor: warn ? 'rgba(217,130,43,0.06)' : undefined,
      }}
    >
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ color: warn ? 'warning.main' : 'primary.main', display: 'flex' }}>{icon}</Box>
        </Stack>
        {loading ? (
          <Skeleton variant="text" width={64} sx={{ fontSize: '2.4rem' }} />
        ) : (
          <Typography
            variant="h1"
            sx={{ mt: 0.5, color: warn ? 'warning.dark' : 'text.primary' }}
            data-testid={`metric-${title}`}
          >
            {value ?? 0}
          </Typography>
        )}
        <Box sx={{ minHeight: 22, mt: 0.5 }}>
          {loading ? <Skeleton variant="text" width="80%" /> : footer}
        </Box>
      </CardContent>
    </Card>
  )
}

const SectionCard = ({
  title,
  action,
  children,
}: {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1 }}
      >
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </CardContent>
  </Card>
)

const ListSkeleton = () => (
  <Stack spacing={1}>
    {[0, 1, 2].map((key) => (
      <Skeleton key={key} variant="rounded" height={48} />
    ))}
  </Stack>
)

const Dashboard = () => {
  const { data: metrics, isLoading: metricsLoading, isError } = useGetDashboardMetrics()
  const { data: recent, isLoading: recentLoading } = useGetServiceOrders({ limit: 8 })
  const { data: overdue, isLoading: overdueLoading } = useGetServiceOrders({
    overdue: true,
    limit: 20,
  })
  const { data: pickup, isLoading: pickupLoading } = useGetServiceOrders({
    completedNotDeliveredDays: PICKUP_ALERT_DAYS,
    limit: 20,
  })

  const overdueOrders = overdue?.data ?? []
  const pickupOrders = pickup?.data ?? []

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}
        >
          <Typography variant="h2">Dashboard</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/service-orders/new"
          >
            New Order
          </Button>
        </Box>

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Could not load the dashboard numbers.
          </Alert>
        )}

        {/* Metrics row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Received today"
              value={metrics?.received.today}
              loading={metricsLoading}
              icon={<InboxIcon />}
              footer={
                <Typography variant="caption" color="text.secondary">
                  Week {metrics?.received.week ?? 0} · Month {metrics?.received.month ?? 0} · Year{' '}
                  {metrics?.received.year ?? 0}
                </Typography>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Open orders"
              value={metrics?.open}
              loading={metricsLoading}
              icon={<BuildIcon />}
              footer={
                <Typography variant="caption" color="text.secondary">
                  {plural(metrics?.awaitingPickup ?? 0, 'repair')} waiting for pickup
                </Typography>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Completed this week"
              value={metrics?.completed.week}
              loading={metricsLoading}
              icon={<DoneAllIcon />}
              footer={
                <Typography variant="caption" color="text.secondary">
                  Today {metrics?.completed.today ?? 0} · Delivered this week{' '}
                  {metrics?.delivered.week ?? 0}
                </Typography>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Overdue"
              value={metrics?.overdue}
              loading={metricsLoading}
              icon={<WarningIcon />}
              tone="warning"
              footer={
                <Typography variant="caption" color="text.secondary">
                  Past estimated completion
                </Typography>
              }
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent orders */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <SectionCard
              title="Recent orders"
              action={
                <MuiLink component={Link} to="/service-orders" underline="hover">
                  View all
                </MuiLink>
              }
            >
              <ServiceOrdersTable
                orders={recent?.data ?? []}
                isLoading={recentLoading}
                columns={['tag', 'customer', 'device', 'status', 'created']}
                emptyText="No orders yet — create the first one."
                size="small"
              />
            </SectionCard>
          </Grid>

          {/* Needs attention */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={3}>
              <SectionCard
                title={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>Needs attention</span>
                    {overdueOrders.length > 0 && (
                      <Chip size="small" color="warning" label={overdue?.total ?? 0} />
                    )}
                  </Stack>
                }
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Overdue repairs, longest overdue first
                </Typography>
                {overdueLoading ? (
                  <ListSkeleton />
                ) : overdueOrders.length === 0 ? (
                  <Alert severity="success" variant="outlined">
                    Nothing overdue.
                  </Alert>
                ) : (
                  <Stack spacing={1} data-testid="overdue-list">
                    {overdueOrders.map((order) => (
                      <Alert
                        key={order.serviceOrderId}
                        severity="warning"
                        icon={false}
                        sx={{ '& .MuiAlert-message': { width: '100%' } }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <Box>
                            <MuiLink
                              component={Link}
                              to={`/service-orders/${order.serviceOrderId}`}
                              sx={{ fontWeight: 700 }}
                            >
                              #{order.tagNo}
                            </MuiLink>{' '}
                            {order.userName}
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              Due {formatDate(order.estimatedCompletionDate)} ·{' '}
                              <strong>
                                {plural(
                                  Math.max(1, daysSince(order.estimatedCompletionDate)),
                                  'day',
                                )}{' '}
                                overdue
                              </strong>
                            </Typography>
                          </Box>
                          <StatusChip status={order.currentStatus} />
                        </Stack>
                      </Alert>
                    ))}
                  </Stack>
                )}
              </SectionCard>

              <SectionCard title={`Ready for pickup over ${PICKUP_ALERT_DAYS} days`}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Finished repairs not yet collected — call these customers
                </Typography>
                {pickupLoading ? (
                  <ListSkeleton />
                ) : pickupOrders.length === 0 ? (
                  <Alert severity="success" variant="outlined">
                    No finished repairs waiting that long.
                  </Alert>
                ) : (
                  <Stack spacing={1} data-testid="pickup-list">
                    {pickupOrders.map((order) => (
                      <Alert
                        key={order.serviceOrderId}
                        severity="info"
                        icon={false}
                        sx={{ '& .MuiAlert-message': { width: '100%' } }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <Box>
                            <MuiLink
                              component={Link}
                              to={`/service-orders/${order.serviceOrderId}`}
                              sx={{ fontWeight: 700 }}
                            >
                              #{order.tagNo}
                            </MuiLink>{' '}
                            {order.userName}
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              Completed {plural(daysSince(order.currentStatusAt), 'day')} ago
                            </Typography>
                          </Box>
                          {order.contactNumber ? (
                            <Button
                              size="small"
                              variant="outlined"
                              href={`tel:${order.contactNumber}`}
                            >
                              {order.contactNumber}
                            </Button>
                          ) : (
                            <Typography variant="caption">No number</Typography>
                          )}
                        </Stack>
                      </Alert>
                    ))}
                  </Stack>
                )}
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default Dashboard
