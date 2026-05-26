import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import TimelineIcon from '@mui/icons-material/Timeline';
import InventoryIcon from '@mui/icons-material/Inventory2';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/customers', label: 'Customers', icon: <PeopleIcon /> },
  { to: '/service-orders', label: 'Service Orders', icon: <BuildIcon /> },
  { to: '/service-timeline', label: 'Service Timeline', icon: <TimelineIcon /> },
  { to: '/products', label: 'Products', icon: <InventoryIcon /> },
];

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <Paper sx={{ width: 260, minHeight: 'calc(100vh - 64px)' }} square>
      <Box sx={{ p: 1 }}>
        <List>
          {links.map((link) => (
            <ListItemButton key={link.to} component={Link} to={link.to} selected={pathname === link.to}>
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Paper>
  );
}
