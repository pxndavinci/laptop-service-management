import { Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
const menu = [
  ['Dashboard', '/'], ['Customers', '/customers'], ['Products', '/products'], ['Service Orders', '/service-orders'], ['Service Timeline', '/service-timeline']
];
export default function Sidebar() {
  const navigate = useNavigate(); const location = useLocation();
  return <Drawer variant='permanent' sx={{ width: 240, '& .MuiDrawer-paper': { width: 240 } }}><Toolbar />
    <List>{menu.map(([label, path]) => <ListItemButton key={path} selected={location.pathname===path} onClick={()=>navigate(path)}><ListItemText primary={label} /></ListItemButton>)}</List></Drawer>;
}
