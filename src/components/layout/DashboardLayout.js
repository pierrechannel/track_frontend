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
} from '@mui/icons-material';
import { useStore } from '../../store/useStore';
import { wsClient } from '../../services/websocket';
import { authAPI, alertsAPI } from '../../services/api';

const drawerWidth = 280;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
    { name: 'Live Map', path: '/map', icon: MapIcon },
    { name: 'Devices', path: '/devices', icon: DevicesIcon },
    { name: 'Missions', path: '/missions', icon: MissionIcon },
    { 
      name: 'Alerts', 
      path: '/alerts', 
      icon: NotificationsIcon,
      badge: alerts.filter(a => !a.acknowledged).length 
    },
    { name: 'Analytics', path: '/analytics', icon: AnalyticsIcon },
  ];

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5" fontWeight={700} color="white">
          MIL-TRACK
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'white' }}>
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      <List sx={{ flex: 1, px: 2, pt: 3 }}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  background: isActive
                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                    : 'transparent',
                  color: isActive ? 'white' : 'text.secondary',
                  '&:hover': {
                    background: isActive
                      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      : 'rgba(59, 130, 246, 0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.name}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                {item.badge > 0 && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="error"
                    sx={{ 
                      height: 24,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.6 },
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 2,
            p: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                fontWeight: 700,
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {user?.username || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role || 'OBSERVER'}
              </Typography>
            </Box>
            <StatusIcon sx={{ color: 'success.main', fontSize: 12 }} />
          </Box>
        </Box>
        <IconButton
          onClick={handleLogout}
          fullWidth
          sx={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            borderRadius: 2,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            },
          }}
        >
          <LogoutIcon sx={{ mr: 1 }} />
          <Typography variant="body2" fontWeight={600}>
            Logout
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ ml: 2 }}>
              MIL-TRACK
            </Typography>
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
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: isMobile ? 8 : 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          minHeight: '100vh',
        }}
      >
        {/* Alert Banner */}
        {unacknowledgedCount > 0 && (
          <Slide direction="down" in={true}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderLeft: '4px solid',
                borderLeftColor: 'error.main',
              }}
              action={
                <IconButton
                  size="small"
                  onClick={() => navigate('/alerts')}
                  sx={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    },
                  }}
                >
                  View
                </IconButton>
              }
            >
              <Typography variant="body2" fontWeight={600}>
                {unacknowledgedCount} Critical Alert{unacknowledgedCount > 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Requires immediate attention
              </Typography>
            </Alert>
          </Slide>
        )}

        <Fade in={true} timeout={500}>
          <Box>
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
