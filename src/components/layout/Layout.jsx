import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  InputBase,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  LocationOn,
  LocalShipping,
  Receipt,
  Person,
  Assignment,
  Assessment,
  AccountBalance,
  ListAlt,
  Person as PersonIcon,
  Logout,
  ArrowBack,
  Search,
  Notifications,
  KeyboardArrowLeft,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;
const collapsedDrawerWidth = 70;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define menu items based on userType
  let menuItems = [];
  if (userType === 'trucker') {
    menuItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { text: 'Live Tracker', icon: <LocationOn />, path: '/live-tracker' },
      { text: 'Fleet', icon: <LocalShipping />, path: '/fleet' },
      { text: 'Billing', icon: <Receipt />, path: '/billing' },
      { text: 'Driver', icon: <Person />, path: '/driver' },
      { text: 'Consignment', icon: <Assignment />, path: '/consignment' },
      { text: 'Bid Management', icon: <ListAlt />, path: '/bid-management' },
      { text: 'Report', icon: <Assessment />, path: '/reports' },
      { text: 'Load Calculator', icon: <AccountBalance />, path: '/loadcalculator' },
    ];
  } else if (userType === 'shipper') {
    menuItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { text: 'Live Tracker', icon: <LocationOn />, path: '/live-tracker' },
      { text: 'Bills', icon: <Receipt />, path: '/bills' },
      { text: 'Consignment', icon: <Assignment />, path: '/consignment' },
      { text: 'Load Board', icon: <ListAlt />, path: '/loadboard' },
      { text: 'Report', icon: <Assessment />, path: '/reports' },
      { text: 'Load Calculator', icon: <AccountBalance />, path: '/loadcalculator' },
    ];
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        position: 'relative'
      }}>
        {sidebarOpen ? (
          <>
            <img
              src="/images/logo_vpower.png"
              alt="Power LOGISTICS"
              style={{
                height: '50px',
                marginBottom: '8px'
              }}
            />
            {/* Toggle Button - positioned floating above sidebar border */}
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                position: 'fixed',
                left: sidebarOpen ? drawerWidth - 16 : collapsedDrawerWidth - 16,
                top: 90,
                backgroundColor: '#1976d2',
                border: 'none',
                width: 32,
                height: 32,
                color: 'white',
                zIndex: 1301,
                transition: 'left 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: '#1565c0',
                  transform: 'scale(1.05)',
                },
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
              }}
            >
              {sidebarOpen ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
            </IconButton>
          </>
        ) : (
          <>
            <img
              src="/images/logo_vpower.png"
              alt="Power LOGISTICS"
              style={{
                height: '40px',
                width: '40px'
              }}
            />

            {/* Toggle Button for collapsed state */}
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                position: 'fixed',
                left: sidebarOpen ? drawerWidth - 16 : collapsedDrawerWidth - 16,
                top: 90,
                backgroundColor: '#1976d2',
                border: 'none',
                width: 32,
                height: 32,
                color: 'white',
                zIndex: 1301,
                transition: 'left 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: '#1565c0',
                  transform: 'scale(1.05)',
                },
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 2,
                borderRadius: 2,
                minHeight: 48,
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                '&.Mui-selected': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemIcon sx={{
                minWidth: sidebarOpen ? 40 : 'auto',
                color: location.pathname === item.path ? 'white' : '#666'
              }}>
                {item.icon}
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '14px',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout Section */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              '&:hover': {
                backgroundColor: '#ffebee',
                color: '#d32f2f',
              },
            }}
          >
            <ListItemIcon sx={{
              minWidth: sidebarOpen ? 40 : 'auto',
              color: '#666'
            }}>
              <Logout />
            </ListItemIcon>
            {sidebarOpen && (
              <ListItemText
                primary="Logout"
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '14px',
                    fontWeight: 500,
                  }
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          ml: { sm: `${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px` },
          backgroundColor: 'white',
          color: '#333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'width 0.3s, margin-left 0.3s',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>



          {/* Search Bar */}
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: 400,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
            }}
          >
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <Search />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search shipments, users, orders...."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Paper>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Side Icons */}
          <IconButton sx={{ mr: 2 }}>
            <Notifications />
          </IconButton>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#1976d2' }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { sm: sidebarOpen ? drawerWidth : collapsedDrawerWidth },
          flexShrink: { sm: 0 },
          transition: 'width 0.3s',
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#f8f9fa',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
              backgroundColor: '#f8f9fa',
              borderRight: '1px solid #e0e0e0',
              transition: 'width 0.3s',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          transition: 'width 0.3s',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout; 