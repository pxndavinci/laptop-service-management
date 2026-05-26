import { Paper, Stack, Typography } from '@mui/material';
import PageTitle from '../components/common/PageTitle';
import { serviceOrders } from '../services/mockData';
export default function ServiceTimeline() {
  const sorted = [...serviceOrders].sort((a,b)=>a.createdAt < b.createdAt ? 1 : -1);
  return <><PageTitle title='Service Timeline' /><Stack spacing={2}>{sorted.map(s=><Paper key={s.id} sx={{ p:2 }}><Typography fontWeight={700}>{s.createdAt} — #{s.id} {s.customerName}</Typography><Typography variant='body2'>{s.deviceModel} • {s.issue}</Typography><Typography variant='body2' color='text.secondary'>Status: {s.status}</Typography></Paper>)}</Stack></>;
}
