import DashboardIcon from '@mui/icons-material/Dashboard'
import ServiceOrdersIcon from '@mui/icons-material/AssignmentTurnedIn'
import CustomersIcon from '@mui/icons-material/People'
import ProductsIcon from '@mui/icons-material/Category'
import ReportsIcon from '@mui/icons-material/BarChart'
import {lazy} from 'react'


const navItems = [
  { label: 'Dashboard', path: '/', icon: DashboardIcon},
  { label: 'Service Orders', path: '/service-orders', icon: ServiceOrdersIcon },
  { label: 'Customers', path: '/customers', icon: CustomersIcon },
  { label: 'Products', path: '/products', icon: ProductsIcon },
  { label: 'Reports', path: '/reports', icon: ReportsIcon },
]

export default navItems