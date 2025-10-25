import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  CircularProgress,
  Fade,
  Snackbar,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  DevicesOther as DevicesIcon
} from '@mui/icons-material';
import { devicesAPI } from '../services/api';
import DeviceCard from '../components/DeviceCard';
import DeviceDialog from '../components/DeviceDialog';
import DeleteDialog from '../components/DeleteDialog';
import LocationDialog from '../components/LocationDialog';

const initialFormData = {
  device_code: '',
  imei: '',
  device_name: '',
  unit: '',
  status: 'active',
  battery_level: 100,
};

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, deviceId: null });
  const [locationDialog, setLocationDialog] = useState({ 
    open: false, 
    device: null, 
    currentLocation: null,
    history: [],
    tabValue: 0,
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await devicesAPI.getAll();
      
      // Handle both paginated and non-paginated responses
      const deviceData = response.data.results || response.data;
      console.log('Loaded devices:', deviceData);
      
      setDevices(Array.isArray(deviceData) ? deviceData : []);
    } catch (error) {
      console.error('Failed to load devices:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Network Error - No response received');
      } else {
        console.error('Error:', error.message);
      }
      
      showSnackbar(
        error.response?.data?.detail || 'Failed to load devices. Check console for details.',
        'error'
      );
      setDevices([]);
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
        device_name: device.device_name,
        unit: device.unit,
        status: device.status,
        battery_level: device.battery_level,
      });
    } else {
      setEditMode(false);
      setCurrentDevice(null);
      setFormData(initialFormData);
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
    // Prepare data for submission with detailed logging
    const submitData = {
      device_code: formData.device_code.trim(),
      imei: formData.imei.trim(),
      device_name: formData.device_name.trim(),
      unit: formData.unit, // This should be a UUID string
      status: formData.status,
      battery_level: parseInt(formData.battery_level),
    };

    console.log('📤 Submitting device data:', JSON.stringify(submitData, null, 2));
    console.log('🔍 Unit value type:', typeof submitData.unit, 'Value:', submitData.unit);

    if (editMode && currentDevice) {
      console.log('🔄 Updating device:', currentDevice.id);
      const response = await devicesAPI.update(currentDevice.id, submitData);
      console.log('✅ Update response:', response.data);
      showSnackbar('Device updated successfully');
    } else {
      console.log('🆕 Creating new device');
      const response = await devicesAPI.create(submitData);
      console.log('✅ Create response:', response.data);
      showSnackbar('Device created successfully');
    }
    
    handleCloseDialog();
    loadDevices();
  } catch (error) {
    console.error('❌ Failed to save device:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('📡 API Response Status:', error.response.status);
      console.error('📡 API Response Data:', error.response.data);
      console.error('📡 API Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('🌐 No response received:', error.request);
    } else {
      console.error('💥 Error message:', error.message);
    }

    // Better error message extraction
    let errorMessage = 'Failed to save device';
    if (error.response?.data) {
      // Handle Django REST framework validation errors
      const errorData = error.response.data;
      
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.non_field_errors) {
        errorMessage = errorData.non_field_errors.join(', ');
      } else {
        // Extract field-specific errors
        const fieldErrors = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        errorMessage = fieldErrors || JSON.stringify(errorData);
      }
    }
    
    showSnackbar(errorMessage, 'error');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={500}>
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
              <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                <Box>
                  <DeviceCard
                    device={device}
                    onEdit={() => handleOpenDialog(device)}
                    onDelete={() => handleOpenDeleteDialog(device.id)}
                    onViewLocation={() => handleViewLocation(device)}
                  />
                </Box>
              </Fade>
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

        {/* Dialogs */}
        <DeviceDialog
          open={openDialog}
          editMode={editMode}
          formData={formData}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
        />

        <LocationDialog
          open={locationDialog.open}
          device={locationDialog.device}
          onClose={handleCloseLocationDialog}
        />

        <DeleteDialog
          open={deleteDialog.open}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDelete}
        />

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