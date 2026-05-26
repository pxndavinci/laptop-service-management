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
} from '@mui/material'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useServiceCompletionReport, useProductUsageReport, useRevenueReport } from '../lib/hooks/useReports'

const COLORS = ['#1976D2', '#4CAF50', '#FF9800', '#F44336', '#9C27B0']

const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-05-01')
  const [endDate, setEndDate] = useState('2026-05-27')

  const { data: completionData, isLoading: completionLoading } = useServiceCompletionReport({
    startDate,
    endDate,
  })
  const { data: productData, isLoading: productLoading } = useProductUsageReport({ startDate, endDate })
  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport({ startDate, endDate })

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            Comprehensive reporting on service orders, products, and revenue metrics.
          </Typography>
        </Box>

        {/* Date Filter */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
              <TextField
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Button variant="contained">Generate Report</Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Service Completion Report */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Service Completion Report" />
              <CardContent>
                {completionLoading ? (
                  <Skeleton variant="rectangular" height={200} />
                ) : completionData ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          Total Orders
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                          {completionData.totalOrders}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          Completed
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#4CAF50' }}>
                          {completionData.completedOrders}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          Pending
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#FF9800' }}>
                          {completionData.pendingOrders}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Revenue by Month" />
              <CardContent>
                {revenueLoading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : revenueData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData.byMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#1976D2" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Revenue by Category" />
              <CardContent>
                {revenueLoading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : revenueData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueData.byCategory}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {revenueData.byCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
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
