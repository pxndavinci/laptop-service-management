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
  Chip,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import LogoIcon from '@mui/icons-material/AssignmentTurnedIn'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ProfileIcon from '@mui/icons-material/AccountCircle'
import { Link, useLocation } from 'react-router-dom'
import navItems from '../lib/constants/navItems'

const DRAWER_WIDTH = 225

interface LayoutProps {
  children: React.ReactNode
}



export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null)
  const location = useLocation()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const drawerOpen = isDesktop ? sidebarOpen : mobileSidebarOpen

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

  const toggleSidebar = () => {
    if (isDesktop) {
      setSidebarOpen((open) => !open)
    } else {
      setMobileSidebarOpen((open) => !open)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant={isDesktop ? 'persistent' : 'temporary'}
        open={drawerOpen}
        onClose={() => setMobileSidebarOpen(false)}
        sx={{
          width: isDesktop && drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#123D39',
            color: '#fff',
            borderRight: 0,
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 2.5, pt: 3, pb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.13)', borderRadius: 2.5, p: 1, display: 'flex' }}>
            <LogoIcon sx={{ fontSize: 25 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', lineHeight: 1.2 }}>
              KS Tech 
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.66)' }}>
              Repair desk
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Navigation */}
        <List sx={{ px: 1.5, pt: 2 }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  mb: 0.75,
                  borderRadius: 2.5,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42, color: isActive ? '#F2B878' : 'rgba(255,255,255,0.78)' }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 650 : 450,
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ p: 2 }}>
          <Chip
            label="Local Shop Workspace"
            size="small"
            sx={{ color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.08)' }}
          />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top App Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            top: 0,
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 68 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={toggleSidebar}
                sx={{ color: 'primary.main' }}
              >
                {drawerOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                Service Management
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
                    bgcolor: 'primary.main',
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
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 2, sm: 3 },
            backgroundColor: 'background.default',
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
