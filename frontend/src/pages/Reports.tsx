import React, { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  LinearProgress,
  Divider,
} from '@mui/material'
import { useServiceCompletionReport, useProductUsageReport, useRevenueReport } from '../lib/hooks/useReports'

const COLORS = ['#1B5E57', '#268A62', '#D9822B', '#C84B47', '#2874A6']

const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-05-01')
  const [endDate, setEndDate] = useState('2026-05-27')

  const { data: completionData, isLoading: completionLoading } = useServiceCompletionReport({
    startDate,
    endDate,
  })
  const { data: productData, isLoading: productLoading } = useProductUsageReport({ startDate, endDate })
  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport({ startDate, endDate })
  const monthlyRevenueMax = Math.max(1, ...(revenueData?.byMonth.map((month) => month.revenue) || []))
  const categoryRevenueMax = Math.max(1, ...(revenueData?.byCategory.map((category) => category.revenue) || []))

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 1, md: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Clear reporting on completed repairs, services used and collections.
          </Typography>
        </Box>

        {/* Date Filter */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'flex-end' } }}>
              <TextField
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
              <TextField
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
              <Button variant="contained">Generate Report</Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Service Completion Report */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Service Completion Report" />
              <CardContent>
                {completionLoading ? (
                  <Skeleton variant="rectangular" height={200} />
                ) : completionData ? (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          Total Orders
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                          {completionData.totalOrders}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          Completed
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#4CAF50' }}>
                          {completionData.completedOrders}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          Pending
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#FF9800' }}>
                          {completionData.pendingOrders}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          Avg. Completion Time
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                          {completionData.averageCompletionTime} days
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                ) : null}
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Chart */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardHeader title="Revenue by Month" />
              <CardContent>
                {revenueLoading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : revenueData ? (
                  <Stack spacing={2.5}>
                    {revenueData.byMonth.map((month) => (
                      <Box key={month.month}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography variant="body2" color="text.secondary">{month.month}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>${month.revenue.toLocaleString()}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(month.revenue / monthlyRevenueMax) * 100}
                          sx={{ height: 10, borderRadius: 8, bgcolor: '#EEF1EE' }}
                        />
                      </Box>
                    ))}
                  </Stack>
                ) : null}
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader title="Revenue by Category" />
              <CardContent>
                {revenueLoading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : revenueData ? (
                  <Stack spacing={2}>
                    {revenueData.byCategory.map((category, index) => (
                      <Box key={category.category}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
                          <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                          <Typography variant="body2" sx={{ flex: 1 }}>{category.category}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>${category.revenue.toLocaleString()}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(category.revenue / categoryRevenueMax) * 100}
                          sx={{
                            height: 7,
                            borderRadius: 8,
                            bgcolor: '#EEF1EE',
                            '& .MuiLinearProgress-bar': { bgcolor: COLORS[index % COLORS.length] },
                          }}
                        />
                      </Box>
                    ))}
                    <Divider />
                    <Typography variant="body2" color="text.secondary">
                      Collections grouped by the service category used.
                    </Typography>
                  </Stack>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Product Usage Report */}
        <Card>
          <CardHeader title="Product Usage Report" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Usage Count
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Revenue
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton />
                        </TableCell>
                        <TableCell>
                          <Skeleton />
                        </TableCell>
                        <TableCell>
                          <Skeleton />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : productData && productData.products.length > 0 ? (
                    productData.products.map((product, index) => (
                      <TableRow key={product.productId} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{product.productName}</TableCell>
                        <TableCell align="right">{product.usageCount}</TableCell>
                        <TableCell align="right">${product.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#999' }}>
                        No product data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default ReportsPage
