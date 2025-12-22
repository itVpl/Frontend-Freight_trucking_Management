import { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Tooltip,
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
  Notifications,
  KeyboardArrowLeft,
  ChevronLeft,
  ChevronRight,
  Email as EmailIcon,
  PersonAdd,
  Warehouse,
  Add,
  Palette,
  InfoOutlined,
  Payment,
} from '@mui/icons-material';
import ContainerIcon from '../icons/ContainerIcon';
import { useAuth } from '../../context/AuthContext';
import UniversalSearch from '../UniversalSearch';
import { useThemeConfig } from '../../context/ThemeContext';

const drawerWidth = 280;
const collapsedDrawerWidth = 70;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState(null);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#1976d2');
  const [globalTextColor, setGlobalTextColor] = useState('#333333');
  const [headerBg, setHeaderBg] = useState('white');
  const [headerText, setHeaderText] = useState('#333333');
  const [headerHover, setHeaderHover] = useState('#e0e0e0');
  const [sidebarBg, setSidebarBg] = useState('#f8f9fa');
  const [sidebarText, setSidebarText] = useState('#333333');
  const [sidebarHover, setSidebarHover] = useState('#f5f5f5');
  const [sidebarSelected, setSidebarSelected] = useState('#1976d2');
  const [sidebarSelectedHover, setSidebarSelectedHover] = useState('#1565c0');
  const [customSectionName, setCustomSectionName] = useState('');
  const [customBg, setCustomBg] = useState('#ffffff');
  const [customText, setCustomText] = useState('#333333');
  const [customHover, setCustomHover] = useState('#e0e0e0');
  const [mainHeaderBg, setMainHeaderBg] = useState('white');
  const [mainHeaderText, setMainHeaderText] = useState('#333333');
  const [mainHeaderHover, setMainHeaderHover] = useState('#e0e0e0');
  const [mainSidebarBg, setMainSidebarBg] = useState('#f8f9fa');
  const [mainSidebarText, setMainSidebarText] = useState('#333333');
  const [mainSidebarHover, setMainSidebarHover] = useState('#f5f5f5');
  const [mainSidebarSelected, setMainSidebarSelected] = useState('#1976d2');
  const [mainSidebarSelectedHover, setMainSidebarSelectedHover] = useState('#1565c0');
  const [previewSection, setPreviewSection] = useState(null);
  const [contentBg, setContentBg] = useState('#f8f9fa');
  const [contentBgImage, setContentBgImage] = useState('');
  const [contentBgImageOpacity, setContentBgImageOpacity] = useState(0);
  const [tableBg, setTableBg] = useState('#ffffff');
  const [tableText, setTableText] = useState('#333333');
  const [tableHeaderBg, setTableHeaderBg] = useState('#f0f4f8');
  const [tableHeaderText, setTableHeaderText] = useState('#333333');
  const [tableButtonBg, setTableButtonBg] = useState('#1976d2');
  const [tableButtonText, setTableButtonText] = useState('#ffffff');
  const [tableBgImage, setTableBgImage] = useState('');
  const [tableBgImageOpacity, setTableBgImageOpacity] = useState(0);
  const { user, logout, userType } = useAuth();
  const { themeConfig, updateTokens, updateSectionColors, resetSection, resetThemeAll, resetTokens } = useThemeConfig();
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

  const openThemeMenu = (event) => {
    setPrimaryColor(themeConfig.tokens?.primary || '#1976d2');
    setGlobalTextColor(themeConfig.tokens?.text || '#333333');
    setHeaderBg(themeConfig.header?.bg || 'white');
    setHeaderText(themeConfig.header?.text || '#333333');
    setHeaderHover(themeConfig.header?.hoverBg || '#e0e0e0');
    setSidebarBg(themeConfig.sidebar?.bg || '#f8f9fa');
    setSidebarText(themeConfig.sidebar?.text || '#333333');
    setSidebarHover(themeConfig.sidebar?.hoverBg || '#f5f5f5');
    setSidebarSelected(themeConfig.sidebar?.selectedBg || (themeConfig.tokens?.primary || '#1976d2'));
    setSidebarSelectedHover(themeConfig.sidebar?.selectedHoverBg || (themeConfig.tokens?.highlight || '#1565c0'));
    setMainHeaderBg(themeConfig.mainHeader?.bg || themeConfig.header?.bg || 'white');
    setMainHeaderText(themeConfig.mainHeader?.text || themeConfig.header?.text || '#333333');
    setMainHeaderHover(themeConfig.mainHeader?.hoverBg || themeConfig.header?.hoverBg || '#e0e0e0');
    setMainSidebarBg(themeConfig.mainSidebar?.bg || themeConfig.sidebar?.bg || '#f8f9fa');
    setMainSidebarText(themeConfig.mainSidebar?.text || themeConfig.sidebar?.text || '#333333');
    setMainSidebarHover(themeConfig.mainSidebar?.hoverBg || themeConfig.sidebar?.hoverBg || '#f5f5f5');
    setMainSidebarSelected(themeConfig.mainSidebar?.selectedBg || themeConfig.sidebar?.selectedBg || (themeConfig.tokens?.primary || '#1976d2'));
    setMainSidebarSelectedHover(themeConfig.mainSidebar?.selectedHoverBg || themeConfig.sidebar?.selectedHoverBg || (themeConfig.tokens?.highlight || '#1565c0'));
    setContentBg(themeConfig.content?.bg || '#f8f9fa');
    setContentBgImage(themeConfig.content?.bgImage || '');
    setContentBgImageOpacity(themeConfig.content?.bgImageOpacity || 0);
    setTableBg(themeConfig.table?.bg || '#ffffff');
    setTableText(themeConfig.table?.text || (themeConfig.tokens?.text || '#333333'));
    setTableHeaderBg(themeConfig.table?.headerBg || '#f0f4f8');
    setTableHeaderText(themeConfig.table?.headerText || (themeConfig.tokens?.text || '#333333'));
    setTableButtonBg(themeConfig.table?.buttonBg || (themeConfig.tokens?.primary || '#1976d2'));
    setTableButtonText(themeConfig.table?.buttonText || '#ffffff');
    setTableBgImage(themeConfig.table?.bgImage || '');
    setTableBgImageOpacity(themeConfig.table?.bgImageOpacity || 0);
    setThemeMenuAnchor(event.currentTarget);
    setThemeDialogOpen(true);
  };

  const compressImageFile = (file, maxW = 1600, maxH = 1200, quality = 0.72) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let w = img.width;
          let h = img.height;
          const ratio = Math.min(maxW / w, maxH / h, 1);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleContentBgImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const dataUrl = await compressImageFile(file);
    const nextOpacity = (!contentBgImageOpacity || contentBgImageOpacity === 0) ? 0.2 : contentBgImageOpacity;
    setContentBgImage(String(dataUrl));
    setContentBgImageOpacity(nextOpacity);
    updateSectionColors('content', { bg: contentBg, bgImage: String(dataUrl), bgImageOpacity: nextOpacity });
  };

  const handleTableBgImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const dataUrl = await compressImageFile(file);
    const nextOpacity = (!tableBgImageOpacity || tableBgImageOpacity === 0) ? 0.2 : tableBgImageOpacity;
    setTableBgImage(String(dataUrl));
    setTableBgImageOpacity(nextOpacity);
    updateSectionColors('table', { bg: tableBg, text: tableText, headerBg: tableHeaderBg, headerText: tableHeaderText, buttonBg: tableButtonBg, buttonText: tableButtonText, bgImage: String(dataUrl), bgImageOpacity: nextOpacity });
  };

  const closeThemeMenu = () => {
    setThemeMenuAnchor(null);
    setThemeDialogOpen(false);
  };

  const applyThemeMenu = () => {
    updateTokens({ primary: primaryColor, text: globalTextColor });
    updateSectionColors('header', { bg: headerBg, text: headerText, hoverBg: headerHover });
    updateSectionColors('sidebar', { bg: sidebarBg, text: sidebarText, hoverBg: sidebarHover, selectedBg: sidebarSelected, selectedHoverBg: sidebarSelectedHover });
    updateSectionColors('mainHeader', { bg: mainHeaderBg, text: mainHeaderText, hoverBg: mainHeaderHover });
    updateSectionColors('mainSidebar', { bg: mainSidebarBg, text: mainSidebarText, hoverBg: mainSidebarHover, selectedBg: mainSidebarSelected, selectedHoverBg: mainSidebarSelectedHover });
    updateSectionColors('content', { bg: contentBg, bgImage: contentBgImage, bgImageOpacity: contentBgImageOpacity });
    updateSectionColors('table', { bg: tableBg, text: tableText, headerBg: tableHeaderBg, headerText: tableHeaderText, buttonBg: tableButtonBg, buttonText: tableButtonText, bgImage: tableBgImage, bgImageOpacity: tableBgImageOpacity });
    setThemeMenuAnchor(null);
    setThemeDialogOpen(false);
  };

  const applyPremiumPreset = () => {
    // Premium: deep navy + gold accents
    setPrimaryColor('#0b3d91');
    setGlobalTextColor('#111827');
    setHeaderBg('#0b3d91');
    setHeaderText('#f8f0e3');
    setHeaderHover('#08306b');
    setSidebarBg('#0f1724');
    setSidebarText('#e6e6e6');
    setSidebarHover('#111827');
    setSidebarSelected('#c9a94f');
    setSidebarSelectedHover('#b5892b');
    setMainHeaderBg('#0b3d91');
    setMainHeaderText('#f8f0e3');
    setMainHeaderHover('#08306b');
    setMainSidebarBg('#0f1724');
    setMainSidebarText('#e6e6e6');
    setMainSidebarSelected('#c9a94f');
    setMainSidebarSelectedHover('#b5892b');
    // apply immediately
    applyThemeMenu();
  };

  const applyLuxuryPreset = () => {
    // Luxury: dark charcoal with champagne gold and soft gradients
    setPrimaryColor('#1f2937');
    setGlobalTextColor('#f5f5f5');
    setHeaderBg('#111827');
    setHeaderText('#f7e7d0');
    setHeaderHover('#0b1220');
    setSidebarBg('#0b0f14');
    setSidebarText('#eae7e1');
    setSidebarHover('#0f1720');
    setSidebarSelected('#d4af37');
    setSidebarSelectedHover('#b5892b');
    setMainHeaderBg('#111827');
    setMainHeaderText('#f7e7d0');
    setMainHeaderHover('#0b1220');
    setMainSidebarBg('#0b0f14');
    setMainSidebarText('#eae7e1');
    setMainSidebarSelected('#d4af37');
    setMainSidebarSelectedHover('#b5892b');
    applyThemeMenu();
  };

  const applyTokensOnly = () => {
    updateTokens({ primary: primaryColor, text: globalTextColor });
  };

  const applyHeaderOnly = () => {
    updateSectionColors('header', { bg: headerBg, text: headerText, hoverBg: headerHover });
  };

  const applySidebarOnly = () => {
    updateSectionColors('sidebar', { bg: sidebarBg, text: sidebarText, hoverBg: sidebarHover, selectedBg: sidebarSelected, selectedHoverBg: sidebarSelectedHover });
  };

  const applyMainHeaderOnly = () => {
    updateSectionColors('mainHeader', { bg: mainHeaderBg, text: mainHeaderText, hoverBg: mainHeaderHover });
  };

  const applyMainSidebarOnly = () => {
    updateSectionColors('mainSidebar', { bg: mainSidebarBg, text: mainSidebarText, hoverBg: mainSidebarHover, selectedBg: mainSidebarSelected, selectedHoverBg: mainSidebarSelectedHover });
  };

  const applyCustomSection = () => {
    if (!customSectionName) return;
    updateSectionColors(customSectionName, { bg: customBg, text: customText, hoverBg: customHover });
  };

  useEffect(() => {
    if (themeDialogOpen) {
      setPrimaryColor(themeConfig.tokens?.primary || '#1976d2');
      setGlobalTextColor(themeConfig.tokens?.text || '#333333');
      setHeaderBg(themeConfig.header?.bg || 'white');
      setHeaderText(themeConfig.header?.text || '#333333');
      setHeaderHover(themeConfig.header?.hoverBg || '#e0e0e0');
      setSidebarBg(themeConfig.sidebar?.bg || '#f8f9fa');
      setSidebarText(themeConfig.sidebar?.text || '#333333');
      setSidebarHover(themeConfig.sidebar?.hoverBg || '#f5f5f5');
      setSidebarSelected(themeConfig.sidebar?.selectedBg || (themeConfig.tokens?.primary || '#1976d2'));
      setSidebarSelectedHover(themeConfig.sidebar?.selectedHoverBg || (themeConfig.tokens?.highlight || '#1565c0'));
      setMainHeaderBg(themeConfig.mainHeader?.bg || themeConfig.header?.bg || 'white');
      setMainHeaderText(themeConfig.mainHeader?.text || themeConfig.header?.text || '#333333');
      setMainHeaderHover(themeConfig.mainHeader?.hoverBg || themeConfig.header?.hoverBg || '#e0e0e0');
      setMainSidebarBg(themeConfig.mainSidebar?.bg || themeConfig.sidebar?.bg || '#f8f9fa');
      setMainSidebarText(themeConfig.mainSidebar?.text || themeConfig.sidebar?.text || '#333333');
      setMainSidebarHover(themeConfig.mainSidebar?.hoverBg || themeConfig.sidebar?.hoverBg || '#f5f5f5');
      setMainSidebarSelected(themeConfig.mainSidebar?.selectedBg || themeConfig.sidebar?.selectedBg || (themeConfig.tokens?.primary || '#1976d2'));
      setMainSidebarSelectedHover(themeConfig.mainSidebar?.selectedHoverBg || themeConfig.sidebar?.selectedHoverBg || (themeConfig.tokens?.highlight || '#1565c0'));
      setContentBg(themeConfig.content?.bg || '#f8f9fa');
      setContentBgImage(themeConfig.content?.bgImage || '');
      setContentBgImageOpacity(themeConfig.content?.bgImageOpacity || 0);
      setTableBg(themeConfig.table?.bg || '#ffffff');
      setTableText(themeConfig.table?.text || (themeConfig.tokens?.text || '#333333'));
      setTableHeaderBg(themeConfig.table?.headerBg || '#f0f4f8');
      setTableHeaderText(themeConfig.table?.headerText || (themeConfig.tokens?.text || '#333333'));
      setTableButtonBg(themeConfig.table?.buttonBg || (themeConfig.tokens?.primary || '#1976d2'));
      setTableButtonText(themeConfig.table?.buttonText || '#ffffff');
      setTableBgImage(themeConfig.table?.bgImage || '');
      setTableBgImageOpacity(themeConfig.table?.bgImageOpacity || 0);
    }
  }, [themeConfig, themeDialogOpen]);

  // Define menu items based on userType
  let menuItems = [];
  if (userType === 'trucker') {
    menuItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { text: 'Live Tracker', icon: <LocationOn />, path: '/live-tracker' },
      { text: 'Add Load', icon: <Add />, path: '/add-load' },
      { text: 'Add Users', icon: <PersonAdd />, path: '/add-user-trucker' },
      { text: 'Add Customer', icon: <PersonAdd />, path: '/add-customer' },
      { text: 'Driver', icon: <Person />, path: '/driver' },
      { text: 'Fleet', icon: <LocalShipping />, path: '/fleet' },
      { text: 'Billing', icon: <Receipt />, path: '/billing' },
      { text: 'Consignment', icon: <Assignment />, path: '/consignment' },
      { text: 'Bid Management', icon: <ListAlt />, path: '/bid-management' },
      { text: 'Payments', icon: <Payment />, path: '/payments' },
      { text: 'Driver', icon: <Person />, path: '/driver' },
      { text: 'Consignment', icon: <Assignment />, path: '/consignment' },
      { text: 'Bid Management', icon: <ListAlt />, path: '/bid-management' },
      { text: 'Add Customer', icon: <PersonAdd />, path: '/add-customer' },
      { text: 'Add Load', icon: <Add />, path: '/add-load' },
      { text: 'Yard', icon: <Warehouse />, path: '/yard' },
      { text: 'Yard Drop Container', icon: <ContainerIcon />, path: '/yard-drop-container' },
      { text: 'Email', icon: <EmailIcon />, path: '/email' },
      { text: 'Report', icon: <Assessment />, path: '/reports' },
      { text: 'Load Calculator', icon: <AccountBalance />, path: '/loadcalculator' },
    ];
  } else if (userType === 'shipper') {
    menuItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { text: 'Live Tracker', icon: <LocationOn />, path: '/live-tracker' },
      { text: 'Load Board', icon: <ListAlt />, path: '/loadboard' },
      { text: 'Add User', icon: <PersonAdd />, path: '/add-user-shipper' },
      { text: 'Billing', icon: <Receipt />, path: '/bills' },
      { text: 'Consignment', icon: <Assignment />, path: '/consignment' },
      { text: 'Email', icon: <EmailIcon />, path: '/email' },
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
                backgroundColor: themeConfig.tokens?.primary || '#1976d2',
                border: 'none',
                width: 32,
                height: 32,
                color: 'white',
                zIndex: 1301,
                transition: 'left 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: themeConfig.tokens?.highlight || '#1565c0',
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
                backgroundColor: themeConfig.tokens?.primary || '#1976d2',
                border: 'none',
                width: 32,
                height: 32,
                color: 'white',
                zIndex: 1301,
                transition: 'left 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: themeConfig.tokens?.highlight || '#1565c0',
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
                  backgroundColor: themeConfig.mainSidebar?.selectedBg || themeConfig.sidebar?.selectedBg || themeConfig.tokens?.primary || '#1976d2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: themeConfig.mainSidebar?.selectedHoverBg || themeConfig.sidebar?.selectedHoverBg || themeConfig.tokens?.highlight || '#1565c0',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: themeConfig.mainSidebar?.hoverBg || themeConfig.sidebar?.hoverBg || themeConfig.tokens?.hover || '#f5f5f5',
                },
              }}
            >
              <ListItemIcon sx={{
                minWidth: sidebarOpen ? 40 : 'auto',
                color: location.pathname === item.path ? 'white' : (themeConfig.mainSidebar?.text || themeConfig.sidebar?.text || '#666')
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
          backgroundColor: themeConfig.mainHeader?.bg || themeConfig.header?.bg || 'white',
          color: themeConfig.mainHeader?.text || themeConfig.header?.text || '#333',
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
            sx={{ mr: 2, display: { sm: 'none' }, '&:hover': { backgroundColor: themeConfig.mainHeader?.hoverBg || themeConfig.header?.hoverBg || '#e0e0e0' } }}
          >
            <MenuIcon />
          </IconButton>



          {/* Universal Search Bar */}
          <Box sx={{ width: 400 }}>
            <UniversalSearch />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Side Icons */}
      <IconButton sx={{ mr: 1, '&:hover': { backgroundColor: themeConfig.mainHeader?.hoverBg || themeConfig.header?.hoverBg || '#e0e0e0' } }} onClick={openThemeMenu} aria-label="theme settings">
        <Palette />
      </IconButton>
          <IconButton sx={{ mr: 2, '&:hover': { backgroundColor: themeConfig.mainHeader?.hoverBg || themeConfig.header?.hoverBg || '#e0e0e0' } }}>
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
            sx={{ '&:hover': { backgroundColor: themeConfig.mainHeader?.hoverBg || themeConfig.header?.hoverBg || '#e0e0e0' } }}
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: themeConfig.tokens?.primary || '#1976d2' }}>
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
              backgroundColor: themeConfig.mainSidebar?.bg || themeConfig.sidebar?.bg || '#f8f9fa',
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
              backgroundColor: themeConfig.mainSidebar?.bg || themeConfig.sidebar?.bg || '#f8f9fa',
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
          backgroundColor: themeConfig.content?.bg || '#f8f9fa',
          minHeight: '100vh',
          transition: 'width 0.3s',
          position: 'relative',
        }}
      >
        <Toolbar />
        {themeConfig.content?.bgImage && (
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${themeConfig.content.bgImage})`,
            backgroundSize: themeConfig.content?.bgSize || 'cover',
            backgroundRepeat: themeConfig.content?.bgRepeat || 'no-repeat',
            backgroundPosition: themeConfig.content?.bgPosition || 'center',
            opacity: themeConfig.content?.bgImageOpacity ?? 0,
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        )}
        <Outlet />
        
        {/* Powered by V Power Footer */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            px: 2,
            py: 1,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            opacity: 0.9,
            transition: 'all 0.3s ease-in-out',
            cursor: 'pointer',
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              '& img': {
                transform: 'scale(1.1)',
              },
              '& .MuiTypography-root': {
                color: themeConfig.tokens?.primary || '#1976d2',
              },
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: themeConfig.tokens?.muted || '#666',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              Powered by
            </Typography>
            <img
              src="/images/logo_vpower.png"
              alt="V Power"
              style={{
                height: '24px',
                width: 'auto',
              }}
            />
            <Typography
              component="span"
              sx={{
                color: themeConfig.tokens?.primary || '#1976d2',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              
            </Typography>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={themeDialogOpen}
        onClose={closeThemeMenu}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #0b0f14 0%, #12161d 100%)',
            border: '1px solid rgba(212,175,55,0.35)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          p: 3,
          background: 'linear-gradient(90deg, rgba(212,175,55,0.25), rgba(212,175,55,0.05))',
          color: '#f7e7d0',
          fontWeight: 700,
          letterSpacing: 0.5
        }}>
          Theme Settings
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button variant="contained" onClick={applyPremiumPreset} sx={{ background: '#c9a94f', color: '#111' }}>Premium Preset</Button>
              <Button variant="contained" onClick={applyLuxuryPreset} sx={{ background: '#d4af37', color: '#111' }}>Luxury Preset</Button>
            </Stack>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2, p: 3, pt: 0 }}>
            <Box sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'linear-gradient(90deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06))' }}>
                <Typography variant="subtitle2" sx={{ color: '#f7e7d0' }}>Global Colors</Typography>
                <Typography variant="caption" sx={{ color: '#eae7e1', opacity: 0.85 }}>
                  Brand primary aur global text color poore app me apply hota hai
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>All Buttons</Typography>
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>All Text</Typography>
                    <input type="color" value={globalTextColor} onChange={(e) => setGlobalTextColor(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="text" onClick={() => resetTokens()} sx={{ color: '#d4af37' }}>Reset</Button>
                    <Button variant="contained" onClick={applyTokensOnly} sx={{ background: '#d4af37', color: '#111' }}>Apply</Button>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Box sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'linear-gradient(90deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06))' }}>
                <Typography variant="subtitle2" sx={{ color: '#f7e7d0' }}>Main Header</Typography>
                <Typography variant="caption" sx={{ color: '#eae7e1', opacity: 0.85 }}>
                  Upar wali top App Bar ke colors yahan se change hote hain
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Top Bar</Typography>
                    <input type="color" value={mainHeaderBg} onChange={(e) => setMainHeaderBg(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Text</Typography>
                    <input type="color" value={mainHeaderText} onChange={(e) => setMainHeaderText(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Hover BG</Typography>
                    <input type="color" value={mainHeaderHover} onChange={(e) => setMainHeaderHover(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="text" onClick={() => resetSection('mainHeader')} sx={{ color: '#d4af37' }}>Reset</Button>
                    <Button variant="contained" onClick={applyMainHeaderOnly} sx={{ background: '#d4af37', color: '#111' }}>Apply</Button>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Box sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'linear-gradient(90deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06))' }}>
                <Typography variant="subtitle2" sx={{ color: '#f7e7d0' }}>Main Sidebar</Typography>
                <Typography variant="caption" sx={{ color: '#eae7e1', opacity: 0.85 }}>
                  Left navigation drawer (sidebar) ka BG, text, hover aur selected
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Background</Typography>
                    <input type="color" value={mainSidebarBg} onChange={(e) => setMainSidebarBg(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Text</Typography>
                    <input type="color" value={mainSidebarText} onChange={(e) => setMainSidebarText(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Hover BG</Typography>
                    <input type="color" value={mainSidebarHover} onChange={(e) => setMainSidebarHover(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Selected BG</Typography>
                    <input type="color" value={mainSidebarSelected} onChange={(e) => setMainSidebarSelected(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Selected Hover BG</Typography>
                    <input type="color" value={mainSidebarSelectedHover} onChange={(e) => setMainSidebarSelectedHover(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="text" onClick={() => resetSection('mainSidebar')} sx={{ color: '#d4af37' }}>Reset</Button>
                    <Button variant="contained" onClick={applyMainSidebarOnly} sx={{ background: '#d4af37', color: '#111' }}>Apply</Button>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Box sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'linear-gradient(90deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06))' }}>
                <Typography variant="subtitle2" sx={{ color: '#f7e7d0' }}>Header</Typography>
                <Typography variant="caption" sx={{ color: '#eae7e1', opacity: 0.85 }}>
                  Dialog titles aur fallback header ke colors yahan se aate hain
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>PopUp Header Background</Typography>
                    <input type="color" value={headerBg} onChange={(e) => setHeaderBg(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Heading Text</Typography>
                    <input type="color" value={headerText} onChange={(e) => setHeaderText(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Hover BG</Typography>
                    <input type="color" value={headerHover} onChange={(e) => setHeaderHover(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="text" onClick={() => resetSection('header')} sx={{ color: '#d4af37' }}>Reset</Button>
                    <Button variant="contained" onClick={applyHeaderOnly} sx={{ background: '#d4af37', color: '#111' }}>Apply</Button>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Box sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'linear-gradient(90deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06))' }}>
                <Typography variant="subtitle2" sx={{ color: '#f7e7d0' }}>Tables</Typography>
                <Typography variant="caption" sx={{ color: '#eae7e1', opacity: 0.85 }}>
                  Table background, text, header aur button colors set karo
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#eae7e1' }}>Background</Typography>
                    <input type="color" value={tableBg} onChange={(e) => setTableBg(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#eae7e1' }}>Text</Typography>
                    <input type="color" value={tableText} onChange={(e) => setTableText(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#eae7e1' }}>Header BG</Typography>
                    <input type="color" value={tableHeaderBg} onChange={(e) => setTableHeaderBg(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#eae7e1' }}>Header Text</Typography>
                    <input type="color" value={tableHeaderText} onChange={(e) => setTableHeaderText(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#eae7e1' }}>Button BG</Typography>
                    <input type="color" value={tableButtonBg} onChange={(e) => setTableButtonBg(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#eae7e1' }}>Button Text</Typography>
                    <input type="color" value={tableButtonText} onChange={(e) => setTableButtonText(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#fff' }}>BG Image URL</Typography>
                    <input
                      type="text"
                      value={tableBgImage}
                      onChange={(e) => setTableBgImage(e.target.value)}
                      placeholder="https://..."
                      style={{
                        flex: '1 1 320px',
                        minWidth: 240,
                        maxWidth: 460,
                        width: '100%',
                        border: '1px solid #ffffff',
                        color: '#ffffff',
                        background: 'transparent',
                        padding: '8px 10px',
                        borderRadius: 8,
                        outline: 'none'
                      }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTableBgImageUpload}
                      style={{
                        flex: '0 1 auto',
                        border: '1px solid #ffffff',
                        color: '#ffffff',
                        background: 'transparent',
                        padding: '6px 8px',
                        borderRadius: 8
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => { setTableBgImage(''); setTableBgImageOpacity(0); }}
                      sx={{
                        border: '1px solid #ffffff',
                        color: '#ffffff',
                        '&:hover': {
                          borderColor: '#d4af37',
                          color: '#d4af37',
                          background: 'rgba(212,175,55,0.08)'
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#eae7e1' }}>Image Opacity</Typography>
                    <input type="range" min="0" max="1" step="0.05" value={tableBgImageOpacity} onChange={(e) => setTableBgImageOpacity(parseFloat(e.target.value))} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="text" onClick={() => resetSection('table')} sx={{ color: '#d4af37' }}>Reset</Button>
                    <Button variant="contained" onClick={() => updateSectionColors('table', { bg: tableBg, text: tableText, headerBg: tableHeaderBg, headerText: tableHeaderText, buttonBg: tableButtonBg, buttonText: tableButtonText, bgImage: tableBgImage, bgImageOpacity: tableBgImageOpacity })} sx={{ background: '#d4af37', color: '#111' }}>Apply</Button>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Box sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'linear-gradient(90deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06))' }}>
                <Typography variant="subtitle2" sx={{ color: '#f7e7d0' }}>Global Background</Typography>
                <Typography variant="caption" sx={{ color: '#eae7e1', opacity: 0.85 }}>
                  App content ka background color ya image set karo
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#eae7e1' }}>Background</Typography>
                    <input type="color" value={contentBg} onChange={(e) => setContentBg(e.target.value)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#fff' }}>BG Image URL</Typography>
                    <input
                      type="text"
                      value={contentBgImage}
                      onChange={(e) => setContentBgImage(e.target.value)}
                      placeholder="https://..."
                      style={{
                        flex: '1 1 320px',
                        minWidth: 240,
                        maxWidth: 460,
                        width: '100%',
                        border: '1px solid #ffffff',
                        color: '#ffffff',
                        background: 'transparent',
                        padding: '8px 10px',
                        borderRadius: 8,
                        outline: 'none'
                      }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleContentBgImageUpload}
                      style={{
                        flex: '0 1 auto',
                        border: '1px solid #ffffff',
                        color: '#ffffff',
                        background: 'transparent',
                        padding: '6px 8px',
                        borderRadius: 8
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => { setContentBgImage(''); setContentBgImageOpacity(0); }}
                      sx={{
                        border: '1px solid #ffffff',
                        color: '#ffffff',
                        '&:hover': {
                          borderColor: '#d4af37',
                          color: '#d4af37',
                          background: 'rgba(212,175,55,0.08)'
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 140, color: '#eae7e1' }}>Image Opacity</Typography>
                    <input type="range" min="0" max="1" step="0.05" value={contentBgImageOpacity} onChange={(e) => setContentBgImageOpacity(parseFloat(e.target.value))} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="text" onClick={() => resetSection('content')} sx={{ color: '#d4af37' }}>Reset</Button>
                    <Button variant="contained" onClick={() => updateSectionColors('content', { bg: contentBg, bgImage: contentBgImage, bgImageOpacity: contentBgImageOpacity })} sx={{ background: '#d4af37', color: '#111' }}>Apply</Button>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* <Box sx={{ p: 2, borderRadius: 3, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography variant="subtitle2" sx={{ color: '#f7e7d0', mb: 0.5 }}>Custom Section</Typography>
              <Typography variant="caption" sx={{ color: '#eae7e1', opacity: 0.85, mb: 1 }}>
                Section ka naam dekar uske colors set karo (e.g. "content")
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Name</Typography>
                  <input type="text" value={customSectionName} onChange={(e) => setCustomSectionName(e.target.value)} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Background</Typography>
                  <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Text</Typography>
                  <input type="color" value={customText} onChange={(e) => setCustomText(e.target.value)} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120, color: '#eae7e1' }}>Hover BG</Typography>
                  <input type="color" value={customHover} onChange={(e) => setCustomHover(e.target.value)} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button variant="text" onClick={applyCustomSection} sx={{ color: '#d4af37' }}>Apply Custom</Button>
                  <Button variant="text" onClick={() => { if (customSectionName) resetSection(customSectionName); }} sx={{ color: '#d4af37' }}>Reset Custom</Button>
                </Box>
              </Stack>
            </Box> */}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button onClick={() => { resetThemeAll(); closeThemeMenu(); }} sx={{ color: '#d4af37' }}>Reset All</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={closeThemeMenu} sx={{ color: '#eae7e1' }}>Cancel</Button>
          <Button variant="contained" onClick={applyThemeMenu} sx={{ background: '#d4af37', color: '#111' }}>Apply All</Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}>
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
