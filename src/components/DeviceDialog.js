import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
} from '@mui/material';

const DeviceDialog = ({ 
  open, 
  editMode, 
  formData, 
  onClose, 
  onSubmit, 
  onInputChange 
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editMode ? 'Edit Device' : 'Add New Device'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Device Code"
            name="device_code"
            value={formData.device_code}
            onChange={onInputChange}
            fullWidth
            required
          />
          <TextField
            label="IMEI"
            name="imei"
            value={formData.imei}
            onChange={onInputChange}
            fullWidth
          />
          <TextField
            label="Unit Name"
            name="unit_name"
            value={formData.unit_name}
            onChange={onInputChange}
            fullWidth
            required
          />
          <TextField
            select
            label="Status"
            name="status"
            value={formData.status}
            onChange={onInputChange}
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
            onChange={onInputChange}
            fullWidth
            inputProps={{ min: 0, max: 100 }}
          />
          <TextField
            label="Assigned To"
            name="assigned_to_name"
            value={formData.assigned_to_name}
            onChange={onInputChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          {editMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceDialog;