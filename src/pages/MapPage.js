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
  useTheme
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
  MyLocation as MyLocationIcon
} from '@mui/icons-material';
import { devicesAPI } from '../services/api';
import { useStore } from '../store/useStore';
import { wsClient } from '../services/websocket';
import MapContainer from '../components/map/MapContainer';

export default function MapPage() {
  const theme = useTheme();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const locations = useStore((state) => state.locations);
  const updateLocation = useStore((state) => state.updateLocation);
  const selectedDevice = useStore((state) => state.selectedDevice);
  const setSelectedDevice = useStore((state) => state.setSelectedDevice);

  useEffect(() => {
    loadDevices();

    const handleLocationUpdate = (location) => {
      updateLocation(location);
    };

    wsClient.on('location', handleLocationUpdate);

    return () => {
      wsClient.off('location', handleLocationUpdate);
    };
  }, []);

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
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
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

  const selectedDeviceData = devices.find(d => d.id === selectedDevice);
  const selectedLocation = selectedDevice ? locations.get(selectedDevice) : null;

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
    <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Map */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <MapContainer
          devices={devices}
          locations={Array.from(locations.values())}
          onDeviceClick={(deviceId) => setSelectedDevice(deviceId)}
          selectedDevice={selectedDevice}
        />
      </Box>

      {/* Device Info Panel */}
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
                          Latitude
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, fontFamily: 'monospace' }}>
                          {selectedLocation.latitude}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
                      }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                          Longitude
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, fontFamily: 'monospace' }}>
                          {selectedLocation.longitude}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        bgcolor: alpha(theme.palette.info.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`
                      }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                          Altitude
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                          {selectedLocation.altitude.toFixed(1)}m
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        bgcolor: alpha(theme.palette.success.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <SpeedIcon sx={{ fontSize: 12, color: 'success.main' }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                            Speed
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {selectedLocation.speed.toFixed(1)} km/h
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        bgcolor: alpha(theme.palette.secondary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <ExploreIcon sx={{ fontSize: 12, color: 'secondary.main' }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                            Heading
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {selectedLocation.heading.toFixed(0)}°
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        bgcolor: alpha(theme.palette.warning.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`
                      }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                          Accuracy
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                          {selectedLocation.accuracy.toFixed(1)}m
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
                        label={`${selectedLocation.signal_strength}/5`}
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
                        label={selectedLocation.satellites}
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
    </Box>
  );
}