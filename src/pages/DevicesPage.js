import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  CircularProgress,
  Fade,
  Zoom,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Battery80 as BatteryIcon,
  SignalCellularAlt as SignalIcon,
  MyLocation as LocationIcon,
  Circle as StatusIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DevicesOther as DevicesIcon,
  History as HistoryIcon,
  Navigation as NavigationIcon,
  Speed as SpeedIcon,
  Height as AltitudeIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { devicesAPI } from '../services/api';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [formData, setFormData] = useState({
    device_code: '',
    imei: '',
    unit_name: '',
    status: 'active',
    battery_level: 100,
    assigned_to_name: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, deviceId: null });
  const [locationDialog, setLocationDialog] = useState({ 
    open: false, 
    device: null, 
    currentLocation: null,
    history: [],
    tabValue: 0,
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [historyHours, setHistoryHours] = useState(24);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await devicesAPI.getAll();
      setDevices(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load devices:', error);
      showSnackbar('Failed to load devices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (device = null) => {
    if (device) {
      setEditMode(true);
      setCurrentDevice(device);
      setFormData({
        device_code: device.device_code,
        imei: device.imei || '',
        unit_name: device.unit_name,
        status: device.status,
        battery_level: device.battery_level,
        assigned_to_name: device.assigned_to_name || '',
      });
    } else {
      setEditMode(false);
      setCurrentDevice(null);
      setFormData({
        device_code: '',
        imei: '',
        unit_name: '',
        status: 'active',
        battery_level: 100,
        assigned_to_name: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentDevice(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editMode && currentDevice) {
        await devicesAPI.update(currentDevice.id, formData);
        showSnackbar('Device updated successfully');
      } else {
        await devicesAPI.create(formData);
        showSnackbar('Device created successfully');
      }
      handleCloseDialog();
      loadDevices();
    } catch (error) {
      console.error('Failed to save device:', error);
      showSnackbar('Failed to save device', 'error');
    }
  };

  const handleOpenDeleteDialog = (deviceId) => {
    setDeleteDialog({ open: true, deviceId });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, deviceId: null });
  };

  const handleDelete = async () => {
    try {
      await devicesAPI.delete(deleteDialog.deviceId);
      showSnackbar('Device deleted successfully');
      handleCloseDeleteDialog();
      loadDevices();
    } catch (error) {
      console.error('Failed to delete device:', error);
      showSnackbar('Failed to delete device', 'error');
    }
  };

  const handleViewLocation = async (device) => {
    setLocationDialog({ 
      open: true, 
      device, 
      currentLocation: null,
      history: [],
      tabValue: 0,
    });
    setLocationLoading(true);

    try {
      // Load current location
      const currentResponse = await devicesAPI.getCurrentLocation(device.id);
      setLocationDialog(prev => ({ ...prev, currentLocation: currentResponse.data }));
    } catch (error) {
      console.error('Failed to load current location:', error);
    }

    try {
      // Load history
      const historyResponse = await devicesAPI.getHistory(device.id, historyHours);
      setLocationDialog(prev => ({ ...prev, history: historyResponse.data }));
    } catch (error) {
      console.error('Failed to load location history:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCloseLocationDialog = () => {
    setLocationDialog({ 
      open: false, 
      device: null, 
      currentLocation: null,
      history: [],
      tabValue: 0,
    });
  };

  const handleLocationTabChange = (event, newValue) => {
    setLocationDialog(prev => ({ ...prev, tabValue: newValue }));
  };

  const handleHistoryHoursChange = async (hours) => {
    setHistoryHours(hours);
    if (locationDialog.device) {
      setLocationLoading(true);
      try {
        const historyResponse = await devicesAPI.getHistory(locationDialog.device.id, hours);
        setLocationDialog(prev => ({ ...prev, history: historyResponse.data }));
      } catch (error) {
        console.error('Failed to load location history:', error);
      } finally {
        setLocationLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getBatteryColor = (level) => {
    if (level > 50) return 'success';
    if (level > 20) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Devices
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and monitor all tracking devices in real-time
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ height: 'fit-content' }}
          >
            Add Device
          </Button>
        </Box>

        <Grid container spacing={3}>
          {devices.map((device, index) => (
            <Grid item xs={12} sm={6} lg={4} key={device.id}>
              <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {device.unit_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {device.device_code}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewLocation(device)} 
                          color="info"
                          title="View Location"
                        >
                          <LocationIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenDialog(device)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenDeleteDialog(device.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Chip
                      label={device.status}
                      color={getStatusColor(device.status)}
                      size="small"
                      icon={<StatusIcon />}
                      sx={{ mb: 2 }}
                    />

                    <Box
                      sx={{
                        background: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BatteryIcon color={getBatteryColor(device.battery_level)} />
                          <Typography variant="body2">Battery</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {device.battery_level}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={device.battery_level}
                        color={getBatteryColor(device.battery_level)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SignalIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">Assigned to</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {device.assigned_to_name || 'Unassigned'}
                        </Typography>
                      </Box>
                      {device.imei && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: 1, borderColor: 'divider' }}>
                          <Typography variant="body2" color="text.secondary">IMEI</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                            {device.imei}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">
                        Last seen: {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {devices.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DevicesIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No devices found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click "Add Device" to create your first device
            </Typography>
          </Box>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? 'Edit Device' : 'Add New Device'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Device Code"
                name="device_code"
                value={formData.device_code}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="IMEI"
                name="imei"
                value={formData.imei}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Unit Name"
                name="unit_name"
                value={formData.unit_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </TextField>
              <TextField
                label="Battery Level"
                name="battery_level"
                type="number"
                value={formData.battery_level}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 0, max: 100 }}
              />
              <TextField
                label="Assigned To"
                name="assigned_to_name"
                value={formData.assigned_to_name}
                onChange={handleInputChange}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Location Dialog */}
        <Dialog open={locationDialog.open} onClose={handleCloseLocationDialog} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <NavigationIcon color="primary" />
              Device Location: {locationDialog.device?.unit_name}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={locationDialog.tabValue} onChange={handleLocationTabChange}>
                <Tab label="Current Location" icon={<LocationIcon />} iconPosition="start" />
                <Tab label="Location History" icon={<HistoryIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            {locationLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Current Location Tab */}
                {locationDialog.tabValue === 0 && (
                  <Box>
                    {locationDialog.currentLocation ? (
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
                                    {locationDialog.currentLocation.latitude?.toFixed(6)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Longitude:</Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {locationDialog.currentLocation.longitude?.toFixed(6)}
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
                                    {locationDialog.currentLocation.speed ? `${locationDialog.currentLocation.speed} km/h` : 'N/A'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Heading:</Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {locationDialog.currentLocation.heading ? `${locationDialog.currentLocation.heading}°` : 'N/A'}
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
                                  {locationDialog.currentLocation.altitude ? `${locationDialog.currentLocation.altitude}m` : 'N/A'}
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
                                {new Date(locationDialog.currentLocation.timestamp).toLocaleString()}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <LocationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          No current location data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* History Tab */}
                {locationDialog.tabValue === 1 && (
                  <Box>
                    <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant={historyHours === 6 ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleHistoryHoursChange(6)}
                      >
                        6 Hours
                      </Button>
                      <Button
                        variant={historyHours === 12 ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleHistoryHoursChange(12)}
                      >
                        12 Hours
                      </Button>
                      <Button
                        variant={historyHours === 24 ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleHistoryHoursChange(24)}
                      >
                        24 Hours
                      </Button>
                      <Button
                        variant={historyHours === 168 ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleHistoryHoursChange(168)}
                      >
                        7 Days
                      </Button>
                    </Box>

                    {locationDialog.history.length > 0 ? (
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
                            {locationDialog.history.map((location, index) => (
                              <TableRow key={index} hover>
                                <TableCell>{new Date(location.timestamp).toLocaleString()}</TableCell>
                                <TableCell>{location.latitude?.toFixed(6)}</TableCell>
                                <TableCell>{location.longitude?.toFixed(6)}</TableCell>
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
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLocationDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this device? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}