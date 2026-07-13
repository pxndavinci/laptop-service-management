import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material'

function MetricCard() {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Skeleton width={80} height={14} sx={{ mb: 1.5 }} />
        <Skeleton width={60} height={32} sx={{ mb: 0.5 }} />
        <Skeleton width={100} height={12} />
      </CardContent>
    </Card>
  )
}

function PlaceholderList({ title }: { title: string }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <Chip label="Coming soon" size="small" variant="outlined" color="primary" />
        </Box>
        <List disablePadding>
          {[1, 2, 3, 4, 5].map((i) => (
            <ListItem key={i} disablePadding sx={{ py: 1 }}>
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar
                  variant="rounded"
                  sx={{ width: 32, height: 32, bgcolor: 'grey.100' }}
                >
                  <Skeleton width={18} height={18} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton width={`${60 + i * 8}%`} height={16} />}
                secondary={<Skeleton width={`${40 + i * 5}%`} height={12} />}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Overview of your service management workspace
        </Typography>
      </Box>

      {/* Metrics row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr 1fr',
            sm: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <MetricCard />
        <MetricCard />
        <MetricCard />
        <MetricCard />
      </Box>

      {/* List sections */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
          },
          gap: 2,
        }}
      >
        <PlaceholderList title="Recent Orders" />
        <PlaceholderList title="Needs Attention" />
      </Box>
    </Box>
  )
}
