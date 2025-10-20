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
} from '@mui/material';
import {
  Navigation as NavigationIcon,
  MyLocation as LocationIcon,  // Correction ici
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

  useEffect(() => {
    if (open && device) {
      loadLocationData();
    }
  }, [open, device, tabValue, historyHours]);

  const loadLocationData = async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        // Load current location
        const currentResponse = await devicesAPI.getCurrentLocation(device.id);
        setCurrentLocation(currentResponse.data);
      } else {
        // Load history
        const historyResponse = await devicesAPI.getHistory(device.id, historyHours);
        setHistory(historyResponse.data);
      }
    } catch (error) {
      console.error('Failed to load location data:', error);
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
    if (!currentLocation) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LocationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No current location data available
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
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
                    {currentLocation.latitude}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Longitude:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {currentLocation.longitude}
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
                {new Date(currentLocation.timestamp).toLocaleString()}
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

      {history.length > 0 ? (
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
                  <TableCell>{new Date(location.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{location.latitude}</TableCell>
                  <TableCell>{location.longitude}</TableCell>
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
            No location history available for the selected period
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
          Device Location: {device?.unit_name}
        </Box>
      </DialogTitle>
      <DialogContent>
        <LocationTabs />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tabValue === 0 && <CurrentLocationTab />}
            {tabValue === 1 && <HistoryTab />}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationDialog;