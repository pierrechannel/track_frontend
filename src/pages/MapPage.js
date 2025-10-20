import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  IconButton, 
  Chip,
  LinearProgress,
  Grid,
  Divider,
  alpha,
  Fade,
  Slide,
  useTheme,
  Button,
  ButtonGroup,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
} from '@mui/material';
import { 
  Close as CloseIcon,
  Battery20 as BatteryLowIcon,
  Battery50 as BatteryMedIcon,
  Battery80 as BatteryHighIcon,
  BatteryFull as BatteryFullIcon,
  SignalCellularAlt as SignalIcon,
  Navigation as NavigationIcon,
  Speed as SpeedIcon,
  Explore as ExploreIcon,
  MyLocation as MyLocationIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Layers as LayersIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { devicesAPI, missionsAPI } from '../services/api';
import { useStore } from '../store/useStore';
import { wsClient } from '../services/websocket';
import MapContainer from '../components/map/MapContainer';

export default function MapPage() {
  const theme = useTheme();
  const [devices, setDevices] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const locations = useStore((state) => state.locations);
  const updateLocation = useStore((state) => state.updateLocation);
  const selectedDevice = useStore((state) => state.selectedDevice);
  const setSelectedDevice = useStore((state) => state.setSelectedDevice);
  
  // New states for advanced features
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [missionFilter, setMissionFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showTrails, setShowTrails] = useState(false);
  const [mapView, setMapView] = useState('standard'); // standard, satellite, terrain
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadInitialData();

    const handleLocationUpdate = (location) => {
      updateLocation(location);
    };

    wsClient.on('location', handleLocationUpdate);

    // Auto-refresh timer
    let refreshInterval;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        refreshDeviceLocations();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      wsClient.off('location', handleLocationUpdate);
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadDevices(),
        loadMissions(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async () => {
    try {
      const response = await devicesAPI.getAll();
      const devicesList = response.data.results || response.data;
      setDevices(devicesList);
      
      for (const device of devicesList) {
        try {
          const locResponse = await devicesAPI.getCurrentLocation(device.id);
          updateLocation(locResponse.data);
        } catch (err) {
          console.error(`Failed to load location for device ${device.id}`);
        }
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const loadMissions = async () => {
    try {
      const response = await missionsAPI.getAll();
      setMissions(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load missions:', error);
    }
  };

  const refreshDeviceLocations = async () => {
    try {
      for (const device of devices) {
        try {
          const locResponse = await devicesAPI.getCurrentLocation(device.id);
          updateLocation(locResponse.data);
        } catch (err) {
          console.error(`Failed to refresh location for device ${device.id}`);
        }
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh locations:', error);
    }
  };

  const handleManualRefresh = () => {
    refreshDeviceLocations();
  };

  const getDeviceStatus = (device) => {
    if (device.status !== 'active') return 'inactive';
    const lastSeen = new Date(device.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / 1000 / 60;
    if (diffMinutes > 10) return 'offline';
    return 'online';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getBatteryIcon = (level) => {
    if (level > 80) return <BatteryFullIcon />;
    if (level > 50) return <BatteryHighIcon />;
    if (level > 20) return <BatteryMedIcon />;
    return <BatteryLowIcon />;
  };

  const getBatteryColor = (level) => {
    if (level > 50) return 'success';
    if (level > 20) return 'warning';
    return 'error';
  };

  // Filter devices based on selected filters
  const filteredDevices = devices.filter(device => {
    const statusMatch = statusFilter === 'all' || device.status === statusFilter;
    const missionMatch = missionFilter === 'all' || 
      missions.find(m => m.id === missionFilter)?.device_ids?.includes(device.id);
    return statusMatch && missionMatch;
  });

  const selectedDeviceData = devices.find(d => d.id === selectedDevice);
  const selectedLocation = selectedDevice ? locations.get(selectedDevice) : null;

  // Count devices by status
  const deviceStatusCounts = {
    online: devices.filter(d => getDeviceStatus(d) === 'online').length,
    offline: devices.filter(d => getDeviceStatus(d) === 'offline').length,
    inactive: devices.filter(d => getDeviceStatus(d) === 'inactive').length,
  };

  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
      }}>
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress 
              size={70} 
              thickness={3}
              sx={{
                color: theme.palette.primary.main,
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }}
            />
            <Typography variant="h6" sx={{ mt: 3, fontWeight: 500, color: 'text.secondary' }}>
              Loading tactical map...
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      {/* Map Controls Overlay - Top Left */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1000,
          p: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderRadius: 2,
          minWidth: 200,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Map Controls
          </Typography>
          
          {/* Status Overview */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<MyLocationIcon />}
              label={`${deviceStatusCounts.online} Online`}
              size="small"
              color="success"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={`${deviceStatusCounts.offline} Offline`}
              size="small"
              color="error"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant={showDeviceList ? 'contained' : 'outlined'}
              startIcon={<MapIcon />}
              onClick={() => setShowDeviceList(!showDeviceList)}
              size="small"
            >
              Device List
            </Button>
            <Button
              fullWidth
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              Filters
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleManualRefresh}
              size="small"
            >
              Refresh
            </Button>
          </Box>

          {/* Auto-refresh toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="caption">
                Auto-refresh (30s)
              </Typography>
            }
          />

          {/* Last refresh time */}
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Box>
      </Paper>

      {/* Filters Panel - Slide from top */}
      <Slide direction="down" in={showFilters} mountOnEnter unmountOnExit>
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            left: 250,
            zIndex: 1000,
            p: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            minWidth: 300,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Filters
            </Typography>
            <IconButton size="small" onClick={() => setShowFilters(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Device Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              fullWidth
            >
              <MenuItem value="all">All Devices</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>

            <TextField
              select
              label="Mission"
              value={missionFilter}
              onChange={(e) => setMissionFilter(e.target.value)}
              size="small"
              fullWidth
            >
              <MenuItem value="all">All Missions</MenuItem>
              {missions.map((mission) => (
                <MenuItem key={mission.id} value={mission.id}>
                  {mission.name}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={showTrails}
                  onChange={(e) => setShowTrails(e.target.checked)}
                  size="small"
                />
              }
              label="Show Movement Trails"
            />

            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setStatusFilter('all');
                setMissionFilter('all');
                setShowTrails(false);
              }}
            >
              Reset Filters
            </Button>
          </Box>
        </Paper>
      </Slide>

      {/* Device List Panel - Slide from left */}
      <Slide direction="right" in={showDeviceList} mountOnEnter unmountOnExit>
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            bottom: 16,
            left: 16,
            zIndex: 999,
            width: 320,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Devices ({filteredDevices.length})
            </Typography>
            <IconButton size="small" onClick={() => setShowDeviceList(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            {filteredDevices.map((device) => {
              const status = getDeviceStatus(device);
              return (
                <ListItem key={device.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    selected={selectedDevice === device.id}
                    onClick={() => setSelectedDevice(device.id)}
                    sx={{
                      borderRadius: 1.5,
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Badge
                        badgeContent=""
                        color={getStatusColor(status)}
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            animation: status === 'online' ? 'pulse 2s infinite' : 'none',
                          },
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                          }
                        }}
                      >
                        <MyLocationIcon color={status === 'online' ? 'success' : 'disabled'} />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {device.unit_name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            icon={getBatteryIcon(device.battery_level)}
                            label={`${device.battery_level}%`}
                            size="small"
                            color={getBatteryColor(device.battery_level)}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {device.device_code}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Slide>

      {/* Map */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <MapContainer
          devices={filteredDevices}
          locations={Array.from(locations.values())}
          onDeviceClick={(deviceId) => setSelectedDevice(deviceId)}
          selectedDevice={selectedDevice}
          showTrails={showTrails}
        />
      </Box>

      {/* Device Info Panel - Right Side */}
      <Slide direction="left" in={Boolean(selectedDeviceData && selectedLocation)} mountOnEnter unmountOnExit>
        <Paper 
          elevation={0}
          sx={{ 
            width: 400, 
            p: 0,
            overflowY: 'auto',
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {selectedDeviceData && selectedLocation && (
            <>
              {/* Header with gradient */}
              <Box sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 3,
                pb: 4,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" sx={{ opacity: 0.9, fontSize: '0.7rem', letterSpacing: 1.5 }}>
                      UNIT TRACKING
                    </Typography>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1.5, mt: 0.5 }}>
                      {selectedDeviceData.unit_name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<MyLocationIcon sx={{ fontSize: 16, color: 'inherit !important' }} />}
                        label={getDeviceStatus(selectedDeviceData).toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getDeviceStatus(selectedDeviceData) === 'online' 
                            ? 'rgba(76, 175, 80, 0.2)' 
                            : 'rgba(244, 67, 54, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                          border: '1px solid',
                          borderColor: getDeviceStatus(selectedDeviceData) === 'online'
                            ? 'rgba(76, 175, 80, 0.5)'
                            : 'rgba(244, 67, 54, 0.5)',
                          '& .MuiChip-icon': {
                            color: 'inherit'
                          }
                        }}
                      />
                      {selectedDeviceData.imei && (
                        <Chip 
                          label={selectedDeviceData.imei}
                          size="small"
                          sx={{
                            bgcolor: alpha('#fff', 0.15),
                            color: 'white',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <IconButton
                    onClick={() => setSelectedDevice(null)}
                    size="small"
                    sx={{ 
                      color: 'white',
                      bgcolor: alpha('#fff', 0.15),
                      '&:hover': { 
                        bgcolor: alpha('#fff', 0.25),
                        transform: 'rotate(90deg)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Content */}
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Quick Actions */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TimelineIcon />}
                    size="small"
                    onClick={() => {
                      // View history functionality
                    }}
                  >
                    History
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CenterIcon />}
                    size="small"
                    onClick={() => {
                      // Center on device
                    }}
                  >
                    Center
                  </Button>
                </Box>

                {/* Battery - Modern Card */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2.5,
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ 
                        color: `${getBatteryColor(selectedDeviceData.battery_level)}.main`,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {getBatteryIcon(selectedDeviceData.battery_level)}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Battery Level
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: `${getBatteryColor(selectedDeviceData.battery_level)}.main` }}>
                      {selectedDeviceData.battery_level}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedDeviceData.battery_level}
                    color={getBatteryColor(selectedDeviceData.battery_level)}
                    sx={{ 
                      height: 10, 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.action.disabledBackground, 0.3),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${theme.palette[getBatteryColor(selectedDeviceData.battery_level)].light}, ${theme.palette[getBatteryColor(selectedDeviceData.battery_level)].main})`
                      }
                    }}
                  />
                </Paper>

                {/* Location Stats Grid */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2.5,
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`
                    }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: 'text.primary' }}>
                    Location Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
                      }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                          Accuracy
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                          {selectedLocation.accuracy?.toFixed(1)}m
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Signal Info */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2.5,
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: 1.5, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.12)
                        }}>
                          <SignalIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Signal Strength
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${selectedLocation.signal_strength || 0}/5`}
                        size="small"
                        sx={{ 
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: 'primary.main'
                        }}
                      />
                    </Box>
                    <Divider sx={{ opacity: 0.6 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: 1.5, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.success.main, 0.12)
                        }}>
                          <NavigationIcon sx={{ fontSize: 20, color: 'success.main' }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Satellites
                        </Typography>
                      </Box>
                      <Chip 
                        label={selectedLocation.satellites || 0}
                        size="small"
                        sx={{ 
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.success.main, 0.12),
                          color: 'success.main'
                        }}
                      />
                    </Box>
                  </Box>
                </Paper>

                {/* Device Assignment */}
                {selectedDeviceData.assigned_to_name && (
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                      Assigned To
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, color: 'info.main' }}>
                      {selectedDeviceData.assigned_to_name}
                    </Typography>
                  </Paper>
                )}

                {/* Last Update */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mt: 1,
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.action.selected, 0.3)
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500,
                      display: 'block'
                    }}
                  >
                    Last updated
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 600,
                      mt: 0.5,
                      fontFamily: 'monospace'
                    }}
                  >
                    {new Date(selectedLocation.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Slide>

      {/* Statistics Card - Bottom Right */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: selectedDeviceData && selectedLocation ? 416 : 16,
          zIndex: 1000,
          p: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderRadius: 2,
          minWidth: 300,
          transition: 'right 0.3s ease',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          System Overview
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.15)}` }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {deviceStatusCounts.online}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Online
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), border: `1px solid ${alpha(theme.palette.error.main, 0.15)}` }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {deviceStatusCounts.offline}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Offline
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.08), border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}` }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {deviceStatusCounts.inactive}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inactive
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {devices.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}