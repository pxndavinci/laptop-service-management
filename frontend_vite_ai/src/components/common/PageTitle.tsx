import { Typography } from '@mui/material';
export default function PageTitle({ title }: { title: string }) { return <Typography variant='h5' sx={{ mb: 2, fontWeight: 700 }}>{title}</Typography>; }
