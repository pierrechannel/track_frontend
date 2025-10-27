import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Alert,
  Chip,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Map as MapIcon,
  Devices as DevicesIcon,
  TrackChanges as MissionIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
  FiberManualRecord as StatusIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  
} from '@mui/icons-material';
import { 
  ManageAccounts,   // User management
} from '@mui/icons-material';
import { useStore } from '../../store/useStore';
import { wsClient } from '../../services/websocket';
import { authAPI, alertsAPI } from '../../services/api';

const drawerWidth = 280;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const user = useStore((state) => state.user);
  const alerts = useStore((state) => state.alerts);
  const setUser = useStore((state) => state.setUser);
  const setAlerts = useStore((state) => state.setAlerts);
  const addAlert = useStore((state) => state.addAlert);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadUser();
    loadAlerts();

    const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
    wsClient.connect(WS_URL);

    const handleAlert = (alert) => {
      addAlert(alert);
    };

    wsClient.on('alert', handleAlert);

    return () => {
      wsClient.off('alert', handleAlert);
      wsClient.disconnect();
    };
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      navigate('/login');
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await alertsAPI.getAll();
      setAlerts(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    }
  };

  const navigation = [
    { name: 'Live Map', path: '/map', icon: MapIcon, color: '#3b82f6' },
    { name: 'Devices', path: '/devices', icon: DevicesIcon, color: '#8b5cf6' },
    { name: 'Missions', path: '/missions', icon: MissionIcon, color: '#ec4899' },
    { 
      name: 'Alerts', 
      path: '/alerts', 
      icon: NotificationsIcon,
      color: '#f59e0b',
      badge: alerts.filter(a => !a.acknowledged).length 
    },
    { name: 'Users', path: '/users', icon: ManageAccounts, color: '#10b981' }, 
    { name: 'Analytics', path: '/analytics', icon: AnalyticsIcon, color: '#10b981' },
    // Settings focus
  ];

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  const drawer = (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#0a0f1e',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
            opacity: 0.1,
          },
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
              }}
            >
              <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="white" letterSpacing={0.5}>
                MIL-TRACK
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Command Center
              </Typography>
            </Box>
          </Box>
          {isMobile && (
            <IconButton 
              onClick={() => setMobileOpen(false)} 
              sx={{ 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, pt: 3 }}>
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Fade in={true} timeout={300} style={{ transitionDelay: `${index * 50}ms` }} key={item.name}>
              <ListItem disablePadding sx={{ mb: 1.5 }}>
                <Tooltip title={item.name} placement="right" arrow>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setMobileOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      background: isActive
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'transparent',
                      border: isActive 
                        ? '1px solid rgba(59, 130, 246, 0.3)'
                        : '1px solid transparent',
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.6)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: `linear-gradient(to bottom, ${item.color}, ${item.color}99)`,
                        opacity: isActive ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                      },
                      '&:hover': {
                        background: isActive
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        transform: 'translateX(4px)',
                        '&::before': {
                          opacity: 1,
                        },
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      py: 1.5,
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: 'inherit', 
                        minWidth: 40,
                        '& svg': {
                          filter: isActive ? `drop-shadow(0 0 8px ${item.color}40)` : 'none',
                        }
                      }}
                    >
                      <Icon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.name}
                      primaryTypographyProps={{ 
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.95rem',
                      }}
                    />
                    {item.badge > 0 && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{ 
                          height: 22,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { 
                              opacity: 1,
                              transform: 'scale(1)',
                            },
                            '50%': { 
                              opacity: 0.8,
                              transform: 'scale(1.05)',
                            },
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </Fade>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', mx: 2 }} />

      {/* User Profile */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            p: 2.5,
            mb: 2,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
              animation: 'rotate 10s linear infinite',
            },
            '@keyframes rotate': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' },
            },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                fontWeight: 700,
                fontSize: '1.25rem',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight={700} color="white" noWrap>
                {user?.username || 'User'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={user?.role || 'OBSERVER'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                />
                <StatusIcon sx={{ color: '#10b981', fontSize: 10 }} />
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Logout Button */}
        <Box
          component="button"
          onClick={handleLogout}
          sx={{
            width: '100%',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 2,
            py: 1.5,
            px: 2,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          <LogoutIcon sx={{ fontSize: 20 }} />
          Logout
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0f1e' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            background: scrolled 
              ? 'rgba(10, 15, 30, 0.95)' 
              : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{
                mr: 2,
                background: 'rgba(59, 130, 246, 0.1)',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.2)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <TrendingUpIcon sx={{ mr: 1, color: '#3b82f6' }} />
            <Typography variant="h6" fontWeight={700}>
              MIL-TRACK
            </Typography>
            {unacknowledgedCount > 0 && (
              <Badge
                badgeContent={unacknowledgedCount}
                color="error"
                sx={{
                  ml: 'auto',
                  '& .MuiBadge-badge': {
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)',
                  }
                }}
              >
                <NotificationsIcon />
              </Badge>
            )}
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#0a0f1e',
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          mt: isMobile ? 8 : 0,
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0f1419 50%, #0a0f1e 100%)',
          minHeight: '100vh',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: drawerWidth,
            right: 0,
            height: '100vh',
            background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Alert Banner */}
        {unacknowledgedCount > 0 && (
          <Slide direction="down" in={true} timeout={500}>
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                mb: 3,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderLeft: '4px solid #ef4444',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)',
                '& .MuiAlert-icon': {
                  color: '#ef4444',
                },
                animation: 'slideDown 0.5s ease-out',
                '@keyframes slideDown': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(-20px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
              action={
                <Box
                  component="button"
                  onClick={() => navigate('/alerts')}
                  sx={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 1.5,
                    px: 2,
                    py: 1,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
                    },
                  }}
                >
                  View All
                </Box>
              }
            >
              <Typography variant="body1" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
                {unacknowledgedCount} Critical Alert{unacknowledgedCount > 1 ? 's' : ''} Detected
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Immediate action required • Click to view details
              </Typography>
            </Alert>
          </Slide>
        )}

        {/* Page Content */}
        <Fade in={true} timeout={800}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}