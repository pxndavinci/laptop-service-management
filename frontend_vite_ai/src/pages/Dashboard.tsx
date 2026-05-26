import { Card, CardContent, Grid, Typography } from '@mui/material';
import PageTitle from '../components/common/PageTitle';
import { getDashboardStats } from '../services/dashboardService';
export default function Dashboard() {
  const stats = getDashboardStats();
  const items = [
    ['Total Orders', stats.totalOrders],
    ['In Progress', stats.inProgress],
    ['Completed', stats.completed],
    ['Today Entries', stats.todayEntries]
  ];
  return <><PageTitle title='Dashboard' /><Grid container spacing={2}>{items.map(([label,val])=><Grid item xs={12} md={3} key={String(label)}><Card><CardContent><Typography color='text.secondary'>{label}</Typography><Typography variant='h4'>{val}</Typography></CardContent></Card></Grid>)}</Grid></>;
}
