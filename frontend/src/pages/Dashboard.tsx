import { Card, CardContent, Grid, Typography } from '@mui/material';

const stats = [
  { label: 'Received Today', value: 6 },
  { label: 'In Progress', value: 11 },
  { label: 'Completed', value: 18 },
  { label: 'Delivered', value: 14 },
];

export default function Dashboard() {
  return (
    <>
      <Typography variant="h4" mb={2}>Dashboard</Typography>
      <Grid container spacing={2}>
        {stats.map((s) => (
          <Grid size={{ xs: 12, md: 3 }} key={s.label}>
            <Card><CardContent><Typography color="text.secondary">{s.label}</Typography><Typography variant="h4">{s.value}</Typography></CardContent></Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
