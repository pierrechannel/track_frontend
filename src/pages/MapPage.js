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
  Divider
} from '@mui/material';
import { 
  Close as CloseIcon,
  Battery20 as BatteryLowIcon,
  Battery50 as BatteryMedIcon,
  Battery80 as BatteryHighIcon,
  BatteryFull as BatteryFullIcon,
  SignalCellularAlt as SignalIcon,
  Navigation as NavigationIcon
} from '@mui/icons-material';
import { devicesAPI } from '../services/api';
import { useStore } from '../store/useStore';
import { wsClient } from '../services/websocket';
import MapContainer from '../components/map/MapContainer';

export default function MapPage() {
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

  // Helper function to safely convert to number
  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'number' ? value : parseFloat(value) || 0;
  };

  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading tactical map...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
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
      {selectedDeviceData && selectedLocation && (
        <Paper 
          elevation={3}
          sx={{ 
            width: 360, 
            p: 3,
            overflowY: 'auto',
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {selectedDeviceData.unit_name}
            </Typography>
            <IconButton
              onClick={() => setSelectedDevice(null)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Status */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={getDeviceStatus(selectedDeviceData).toUpperCase()}
                  color={getStatusColor(getDeviceStatus(selectedDeviceData))}
                  size="small"
                />
              </Box>
            </Paper>

            {/* Battery */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getBatteryIcon(selectedDeviceData.battery_level)}
                  <Typography variant="body2" color="text.secondary">
                    Battery
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedDeviceData.battery_level}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={selectedDeviceData.battery_level}
                color={getBatteryColor(selectedDeviceData.battery_level)}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Paper>

            {/* Location Info */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Location Data
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Latitude
                  </Typography>
                  <Typography variant="body2">
                    {selectedLocation.latitude}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Longitude
                  </Typography>
                  <Typography variant="body2">
                    {selectedLocation.longitude}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Altitude
                  </Typography>
                  <Typography variant="body2">
                    {selectedLocation.altitude.toFixed(1)}m
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Speed
                  </Typography>
                  <Typography variant="body2">
                    {selectedLocation.speed.toFixed(1)} km/h
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Heading
                  </Typography>
                  <Typography variant="body2">
                    {selectedLocation.heading.toFixed(0)}°
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Accuracy
                  </Typography>
                  <Typography variant="body2">
                    {selectedLocation.accuracy.toFixed(1)}m
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Signal Info */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SignalIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Signal
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {selectedLocation.signal_strength}/5
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NavigationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Satellites
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {selectedLocation.satellites}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Last Update */}
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ textAlign: 'center', mt: 1 }}
            >
              Last update: {new Date(selectedLocation.timestamp).toLocaleString()}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}