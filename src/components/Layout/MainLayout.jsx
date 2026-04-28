import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Badge,
  Collapse,
  useTheme,
  useMediaQuery,
  alpha,
  Stack,
  Chip,
  SwipeableDrawer,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
  LocalGasStation as FuelIcon,
  Emergency as EmergencyIcon,
  CreditCard as PaymentIcon,
  Star as StarIcon,
  SupportAgent as SupportIcon,
  PrivacyTip as PrivacyIcon,
  Security as SecurityIcon,
  CarCrash as CarCrashIcon,
  Speed as SpeedIcon,
  LocationOn as LocationIcon,
  Wallet as WalletIcon,
  Receipt as ReceiptIcon,
  Info as InfoIcon,
  Feedback as FeedbackIcon,
  Policy as PolicyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

// Menu configuration with sub-menus
const menuConfig = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    type: 'single',
  },
  {
    text: 'Services',
    icon: <BuildIcon />,
    type: 'parent',
    children: [
      { text: 'New Breakdown Request', icon: <CarCrashIcon />, path: '/breakdown/new' },
      { text: 'Request Towing', icon: <SpeedIcon />, path: '/towing' },
      { text: 'Emergency SOS', icon: <EmergencyIcon />, path: '/emergency', color: 'error' },
      { text: 'Track My Service', icon: <LocationIcon />, path: '/track-service' },
    ],
  },
  {
    text: 'My Account',
    icon: <PersonIcon />,
    type: 'parent',
    children: [
      { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
      { text: 'My Vehicles', icon: <FuelIcon />, path: '/vehicles' },
      { text: 'Saved Locations', icon: <LocationIcon />, path: '/saved-locations' },
      { text: 'Payment Methods', icon: <PaymentIcon />, path: '/payment-methods' },
      { text: 'Wallet', icon: <WalletIcon />, path: '/wallet' },
    ],
  },
  {
    text: 'History',
    icon: <HistoryIcon />,
    type: 'parent',
    children: [
      { text: 'Service History', icon: <ReceiptIcon />, path: '/history' },
      { text: 'Payment History', icon: <PaymentIcon />, path: '/payment-history' },
      { text: 'My Ratings', icon: <StarIcon />, path: '/ratings' },
    ],
  },
  {
    text: 'Support',
    icon: <SupportIcon />,
    type: 'parent',
    children: [
      { text: 'Help Center', icon: <HelpIcon />, path: '/help' },
      { text: 'Live Chat', icon: <SupportIcon />, path: '/chat' },
      { text: 'FAQ', icon: <InfoIcon />, path: '/faq' },
      { text: 'Feedback', icon: <FeedbackIcon />, path: '/feedback' },
    ],
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    type: 'parent',
    children: [
      { text: 'Account Settings', icon: <SettingsIcon />, path: '/settings' },
      { text: 'Privacy', icon: <PrivacyIcon />, path: '/privacy' },
      { text: 'Security', icon: <SecurityIcon />, path: '/security' },
      { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
      { text: 'Terms & Conditions', icon: <PolicyIcon />, path: '/terms' },
    ],
  },
];

const MainLayout = () => {
  const [open, setOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // Auto close drawer on mobile
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
      setCollapsed(false);
    } else if (isTablet) {
      setCollapsed(true);
      setOpen(false);
    } else {
      setCollapsed(false);
      setOpen(true);
    }
  }, [isMobile, isTablet]);

  // Initialize sub-menu states based on current path
  useEffect(() => {
    const initialOpenState = {};
    menuConfig.forEach((item) => {
      if (item.type === 'parent') {
        const isActive = item.children.some((child) => child.path === location.pathname);
        if (isActive) {
          initialOpenState[item.text] = true;
        }
      }
    });
    setOpenSubMenus(initialOpenState);
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    if (collapsed) {
      setCollapsed(false);
      setOpen(true);
    } else if (open) {
      if (isTablet) {
        setCollapsed(true);
        setOpen(false);
      } else {
        setOpen(false);
      }
    } else {
      setOpen(true);
      setCollapsed(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleSubMenuToggle = (menuText) => {
    if (collapsed) {
      // If collapsed, expand the drawer first
      setCollapsed(false);
      setOpen(true);
      setTimeout(() => {
        setOpenSubMenus((prev) => ({
          ...prev,
          [menuText]: !prev[menuText],
        }));
      }, 200);
    } else {
      setOpenSubMenus((prev) => ({
        ...prev,
        [menuText]: !prev[menuText],
      }));
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (parentItem) => {
    return parentItem.children.some((child) => child.path === location.pathname);
  };

  // Render menu items
  const renderMenuItem = (item, depth = 0) => {
    if (item.type === 'single') {
      const isActive = isActiveRoute(item.path);
      return (
        <ListItem key={item.text} disablePadding sx={{ mb: 0.5, display: 'block' }}>
          <Tooltip title={collapsed ? item.text : ''} placement="right">
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'initial',
                px: collapsed ? 1.5 : 2.5,
                borderRadius: 2,
                mx: collapsed ? 0.5 : 1,
                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: 'center',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      );
    }

    if (item.type === 'parent') {
      const isParentActiveFlag = isParentActive(item);
      const isOpen = openSubMenus[item.text] || false;

      return (
        <Box key={item.text}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip title={collapsed ? item.text : ''} placement="right">
              <ListItemButton
                onClick={() => handleSubMenuToggle(item.text)}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'space-between',
                  px: collapsed ? 1.5 : 2.5,
                  borderRadius: 2,
                  mx: collapsed ? 0.5 : 1,
                  bgcolor: isParentActiveFlag ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: 'center',
                      color: isParentActiveFlag ? theme.palette.primary.main : theme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isParentActiveFlag ? 600 : 400,
                      }}
                    />
                  )}
                </Box>
                {!collapsed && (
                  <Box>
                    {isOpen ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />}
                  </Box>
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          {!collapsed && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child) => {
                  const isChildActive = isActiveRoute(child.path);
                  return (
                    <ListItem key={child.text} disablePadding sx={{ display: 'block', pl: 3 }}>
                      <ListItemButton
                        onClick={() => handleNavigate(child.path)}
                        sx={{
                          minHeight: 40,
                          borderRadius: 2,
                          mx: 1,
                          mb: 0.5,
                          pl: 4,
                          bgcolor: isChildActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                          color: child.color === 'error' ? theme.palette.error.main : 
                                 isChildActive ? theme.palette.primary.main : theme.palette.text.primary,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 35,
                            color: child.color === 'error' ? theme.palette.error.main :
                                   isChildActive ? theme.palette.primary.main : theme.palette.text.secondary,
                          }}
                        >
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={child.text}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: isChildActive ? 500 : 400,
                          }}
                        />
                        {child.color === 'error' && (
                          <Chip
                            label="SOS"
                            size="small"
                            color="error"
                            sx={{ height: 20, fontSize: '0.625rem' }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          )}
        </Box>
      );
    }
    return null;
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: collapsed ? 1.5 : 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40,
              }}
            >
              <BuildIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Roadside Assist
            </Typography>
          </Box>
        )}
        {collapsed && (
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
            }}
          >
            <BuildIcon />
          </Avatar>
        )}
        {!collapsed && !isMobile && (
          <IconButton onClick={() => setCollapsed(true)} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
        {collapsed && !isMobile && (
          <IconButton onClick={() => { setCollapsed(false); setOpen(true); }} size="small">
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>

      {/* User Info Section (only when not collapsed) */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme.palette.primary.main,
                fontSize: '1.5rem',
              }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, noWrap: true }}>
                {user?.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user?.phone_number}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Box component="span" sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
                <Typography variant="caption" color="success.main">
                  Verified
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* User Avatar only when collapsed */}
      {collapsed && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Tooltip title={user?.full_name} placement="right">
            <Avatar
              sx={{
                width: 45,
                height: 45,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Tooltip>
        </Box>
      )}

      {/* Menu Items */}
      <List sx={{ flex: 1, px: collapsed ? 0.5 : 1, py: 2, overflow: 'auto' }}>
        {menuConfig.map((item) => renderMenuItem(item))}
      </List>

      {/* Footer Menu */}
      <Box sx={{ p: collapsed ? 1 : 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Tooltip title={collapsed ? 'Help & Support' : ''} placement="right">
            <ListItemButton
              onClick={() => handleNavigate('/help')}
              sx={{
                borderRadius: 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1.5 : 2.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}>
                <HelpIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Help & Support" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </Box>
    </Box>
  );

  // Different drawer for mobile and desktop
  const drawerElement = (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={isMobile ? handleDrawerToggle : undefined}
      sx={{
        width: collapsed ? collapsedDrawerWidth : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? collapsedDrawerWidth : drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          left: 0,
          width: '100%',
          ...(!isMobile && {
            width: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)`,
            left: collapsed ? collapsedDrawerWidth : drawerWidth,
            transition: theme.transitions.create(['width', 'left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            {!isMobile && (
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                Welcome back, {user?.full_name?.split(' ')[0]}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton onClick={handleNotificationOpen}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Account">
              <IconButton onClick={handleMenuOpen}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {user?.full_name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 220,
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={() => { handleNavigate('/profile'); handleMenuClose(); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={() => { handleNavigate('/settings'); handleMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => { handleNavigate('/wallet'); handleMenuClose(); }}>
          <ListItemIcon>
            <WalletIcon fontSize="small" />
          </ListItemIcon>
          Wallet
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 360,
            maxHeight: 450,
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
            Mark all as read
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
          {[1, 2, 3, 4].map((item) => (
            <MenuItem key={item} sx={{ flexDirection: 'column', alignItems: 'flex-start', whiteSpace: 'normal', py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Badge variant="dot" color="primary" />
                <Typography variant="body2" fontWeight={500}>
                  {item === 1 ? 'Service Update' : item === 2 ? 'Payment Received' : item === 3 ? 'Promotion' : 'System Update'}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {item === 1 ? 'Your mechanic is on the way' : 
                 item === 2 ? 'Payment of ₹499 was successful' : 
                 item === 3 ? 'Get 20% off on next service' : 
                 'System maintenance scheduled for tonight'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {item} hour{item !== 1 ? 's' : ''} ago
              </Typography>
            </MenuItem>
          ))}
        </Box>
        <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>
            View all notifications
          </Typography>
        </Box>
      </Menu>

      {/* Drawer */}
      {drawerElement}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: '64px',
          bgcolor: 'background.default',
          minHeight: '100vh',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;