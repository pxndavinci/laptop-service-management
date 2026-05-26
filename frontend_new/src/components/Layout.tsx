import React, { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  AssignmentTurnedIn as ServiceOrdersIcon,
  People as CustomersIcon,
  Category as ProductsIcon,
  BarChart as ReportsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'

const DRAWER_WIDTH = 260

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { label: 'Dashboard', path: '/', icon: DashboardIcon },
  { label: 'Service Orders', path: '/service-orders', icon: ServiceOrdersIcon },
  { label: 'Customers', path: '/customers', icon: CustomersIcon },
  { label: 'Products', path: '/products', icon: ProductsIcon },
  { label: 'Reports', path: '/reports', icon: ReportsIcon },
]

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null)
  const location = useLocation()

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            zIndex: 1200,
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ServiceOrdersIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Service Mgmt
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Navigation */}
        <List sx={{ px: 0 }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  px: 2,
                  py: 1.5,
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  backgroundColor: isActive ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  color: isActive ? '#42A5F5' : '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#42A5F5' : '#fff' }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top App Bar */}
        <AppBar
          position="static"
          sx={{
            backgroundColor: '#FFFFFF',
            color: '#212121',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ color: '#1976D2' }}
              >
                {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                Service Management System
              </Typography>
            </Box>

            {/* Profile Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0.5 }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#1976D2',
                    width: 36,
                    height: 36,
                    cursor: 'pointer',
                  }}
                >
                  U
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem disabled>
                  <ProfileIcon sx={{ mr: 1 }} />
                  <Typography>User Profile</Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography>Settings</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Typography>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            backgroundColor: '#FAFAFA',
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
