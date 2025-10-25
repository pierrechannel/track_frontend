import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { unitsAPI } from '../services/api'; // Import the units API

const DeviceDialog = ({ 
  open, 
  editMode, 
  formData, 
  onClose, 
  onSubmit, 
  onInputChange,
  loading = false,
  error = null,
}) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitsError, setUnitsError] = useState(null);

  useEffect(() => {
    if (open) {
      setValidationErrors({});
      setUnitsError(null);
      fetchUnits();
    }
  }, [open]);

  const fetchUnits = async () => {
    try {
      setUnitsLoading(true);
      setUnitsError(null);
      
      console.log('🔄 Fetching units from API...');
      const response = await unitsAPI.getAll();
      console.log('📋 Units API response:', response.data);
      
      // Extract units from paginated response
      const unitsData = response.data.results || response.data || [];
      console.log('📋 Available units:', unitsData);
      
      setUnits(Array.isArray(unitsData) ? unitsData : []);
      
    } catch (err) {
      console.error('❌ Error fetching units:', err);
      console.error('❌ Error details:', err.response?.data);
      setUnitsError('Failed to load units data. Please try again.');
      setUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Enhanced validation with unit existence check
    const errors = {};
    
    if (!formData.device_code?.trim()) {
      errors.device_code = 'Device code is required';
    }
    
    if (!formData.device_name?.trim()) {
      errors.device_name = 'Device name is required';
    }
    
    if (!formData.imei?.trim()) {
      errors.imei = 'IMEI is required';
    } else if (formData.imei.length < 15 || formData.imei.length > 20) {
      errors.imei = 'IMEI must be between 15 and 20 characters';
    }
    
    // Check if selected unit exists in available units
    if (!editMode && !formData.unit) {
      errors.unit = 'Unit is required for new devices';
    } else if (formData.unit) {
      const unitExists = units.some(unit => unit.id === formData.unit);
      if (!unitExists) {
        errors.unit = 'Selected unit does not exist. Please refresh the list.';
      }
    }
    
    const batteryLevel = parseInt(formData.battery_level);
    if (isNaN(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
      errors.battery_level = 'Battery level must be between 0 and 100';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear errors and submit
    setValidationErrors({});
    onSubmit();
  };

  const handleClose = () => {
    setValidationErrors({});
    setUnitsError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editMode ? 'Edit Device' : 'Add New Device'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* Display main error */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Display units loading error */}
            {unitsError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {unitsError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Device Code"
                  name="device_code"
                  value={formData.device_code || ''}
                  onChange={onInputChange}
                  required
                  margin="normal"
                  error={!!validationErrors.device_code}
                  helperText={validationErrors.device_code}
                  disabled={editMode}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="IMEI Number"
                  name="imei"
                  value={formData.imei || ''}
                  onChange={onInputChange}
                  required
                  margin="normal"
                  error={!!validationErrors.imei}
                  helperText={validationErrors.imei || 'Must be 15-20 characters'}
                  inputProps={{ maxLength: 20 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Device Name"
                  name="device_name"
                  value={formData.device_name || ''}
                  onChange={onInputChange}
                  required
                  margin="normal"
                  error={!!validationErrors.device_name}
                  helperText={validationErrors.device_name}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  margin="normal" 
                  error={!!validationErrors.unit}
                  disabled={unitsLoading}
                >
                  <InputLabel>Unit {!editMode && '*'}</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit || ''}
                    label={`Unit ${!editMode && '*'}`}
                    onChange={onInputChange}
                    disabled={editMode || unitsLoading}
                  >
                    <MenuItem value="">
                      <em>
                        {unitsLoading ? 'Loading units...' : 'Select a unit'}
                      </em>
                    </MenuItem>
                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.unit_name} ({unit.unit_code}) - {unit.status}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.unit && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                      {validationErrors.unit}
                    </Box>
                  )}
                  {unitsLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CircularProgress size={16} />
                      <Box sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                        Loading units...
                      </Box>
                    </Box>
                  )}
                  {!unitsLoading && units.length === 0 && (
                    <Box sx={{ color: 'warning.main', fontSize: '0.75rem', mt: 0.5 }}>
                      No units available. Please create units first.
                    </Box>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status || 'active'}
                    label="Status"
                    onChange={onInputChange}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Battery Level (%)"
                  name="battery_level"
                  type="number"
                  value={formData.battery_level || 100}
                  onChange={onInputChange}
                  inputProps={{ min: 0, max: 100 }}
                  margin="normal"
                  error={!!validationErrors.battery_level}
                  helperText={validationErrors.battery_level}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading || unitsLoading || (!editMode && units.length === 0)}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {editMode ? 'Update Device' : 'Create Device'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DeviceDialog;