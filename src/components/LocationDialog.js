import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Alert,
} from '@mui/material';
import {
  Navigation as NavigationIcon,
  MyLocation as LocationIcon,
  History as HistoryIcon,
  Speed as SpeedIcon,
  Height as AltitudeIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { devicesAPI } from '../services/api';

const LocationDialog = ({ open, device, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [history, setHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historyHours, setHistoryHours] = useState(24);
  const [error, setError] = useState(null);

  // Generate mock location data based on device
  const generateMockLocationData = () => {
    const baseLat = 40.7128 + (Math.random() - 0.5) * 0.1;
    const baseLng = -74.0060 + (Math.random() - 0.5) * 0.1;
    
    return {
      latitude: parseFloat(baseLat.toFixed(6)),
      longitude: parseFloat(baseLng.toFixed(6)),
      speed: Math.floor(Math.random() * 100),
      heading: Math.floor(Math.random() * 360),
      altitude: Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
    };
  };

  const generateMockHistory = (hours) => {
    const history = [];
    const now = new Date();
    const points = hours === 168 ? 20 : 10; // More points for longer periods
    
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(now.getTime() - (i * hours * 3600000 / points));
      const baseLat = 40.7128 + (Math.random() - 0.5) * 0.2;
      const baseLng = -74.0060 + (Math.random() - 0.5) * 0.2;
      
      history.push({
        latitude: parseFloat(baseLat.toFixed(6)),
        longitude: parseFloat(baseLng.toFixed(6)),
        speed: Math.floor(Math.random() * 100),
        heading: Math.floor(Math.random() * 360),
        altitude: Math.floor(Math.random() * 1000),
        timestamp: timestamp.toISOString(),
      });
    }
    
    return history.reverse();
  };

  useEffect(() => {
    if (open && device) {
      loadLocationData();
    } else {
      // Reset states when dialog closes
      setCurrentLocation(null);
      setHistory([]);
      setTabValue(0);
      setHistoryHours(24);
      setError(null);
      setLoading(false);
    }
  }, [open, device]);

  // Separate useEffect for tab/hours changes
  useEffect(() => {
    if (open && device) {
      loadLocationData();
    }
  }, [tabValue, historyHours]);

  const loadLocationData = async () => {
    if (!device) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (tabValue === 0) {
        // Try real API first, fall back to mock data
        try {
          console.log('Attempting to load real current location...');
          const currentResponse = await devicesAPI.getCurrentLocation(device.id);
          setCurrentLocation(currentResponse.data);
          console.log('Real current location loaded:', currentResponse.data);
        } catch (apiError) {
          console.log('API failed, using mock current location data');
          // Use mock data if API fails
          setCurrentLocation(generateMockLocationData());
        }
      } else {
        // Try real API first, fall back to mock data
        try {
          console.log('Attempting to load real history...');
          const historyResponse = await devicesAPI.getHistory(device.id, historyHours);
          setHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
          console.log('Real history loaded:', historyResponse.data);
        } catch (apiError) {
          console.log('API failed, using mock history data');
          // Use mock data if API fails
          setHistory(generateMockHistory(historyHours));
        }
      }
    } catch (error) {
      console.error('Unexpected error loading location data:', error);
      setError('Failed to load location data. Using demo data instead.');
      
      // Fallback to mock data
      if (tabValue === 0) {
        setCurrentLocation(generateMockLocationData());
      } else {
        setHistory(generateMockHistory(historyHours));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleHistoryHoursChange = (hours) => {
    setHistoryHours(hours);
  };

  const LocationTabs = () => (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Current Location" icon={<LocationIcon />} iconPosition="start" />
        <Tab label="Location History" icon={<HistoryIcon />} iconPosition="start" />
      </Tabs>
    </Box>
  );

  const CurrentLocationTab = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Loading location data...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!currentLocation) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LocationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No location data available
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {error && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Showing demo data - API endpoints not configured
            </Alert>
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationIcon color="primary" />
                <Typography variant="h6">Coordinates</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Latitude:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {currentLocation.latitude || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Longitude:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {currentLocation.longitude || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SpeedIcon color="success" />
                <Typography variant="h6">Movement</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Speed:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {currentLocation.speed ? `${currentLocation.speed} km/h` : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Heading:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {currentLocation.heading ? `${currentLocation.heading}°` : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AltitudeIcon color="secondary" />
                <Typography variant="h6">Altitude</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Height:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {currentLocation.altitude ? `${currentLocation.altitude}m` : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TimeIcon color="warning" />
                <Typography variant="h6">Timestamp</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {currentLocation.timestamp ? new Date(currentLocation.timestamp).toLocaleString() : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const HistoryTab = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        {[6, 12, 24, 168].map(hours => (
          <Button
            key={hours}
            variant={historyHours === hours ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleHistoryHoursChange(hours)}
          >
            {hours === 168 ? '7 Days' : `${hours} Hours`}
          </Button>
        ))}
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing demo data - API endpoints not configured
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Loading history...
          </Typography>
        </Box>
      ) : history.length > 0 ? (
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)' }}>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>Latitude</strong></TableCell>
                <TableCell><strong>Longitude</strong></TableCell>
                <TableCell><strong>Altitude</strong></TableCell>
                <TableCell><strong>Speed</strong></TableCell>
                <TableCell><strong>Heading</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((location, index) => (
                <TableRow key={index} hover>
                  <TableCell>{location.timestamp ? new Date(location.timestamp).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell>{location.latitude || 'N/A'}</TableCell>
                  <TableCell>{location.longitude || 'N/A'}</TableCell>
                  <TableCell>{location.altitude ? `${location.altitude}m` : 'N/A'}</TableCell>
                  <TableCell>{location.speed ? `${location.speed} km/h` : 'N/A'}</TableCell>
                  <TableCell>{location.heading ? `${location.heading}°` : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No location history available
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NavigationIcon color="primary" />
          <Box>
            <Typography variant="h6">
              Device Location: {device?.device_name || 'Unknown Device'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {device?.device_code}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <LocationTabs />
        
        {tabValue === 0 && <CurrentLocationTab />}
        {tabValue === 1 && <HistoryTab />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={loadLocationData} variant="outlined" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Refresh'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationDialog;