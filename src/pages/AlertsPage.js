import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Avatar,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { alertsAPI } from '../services/api';
import { useStore } from '../store/useStore';

export default function AlertsPage() {
  const alerts = useStore((state) => state.alerts);
  const setAlerts = useStore((state) => state.setAlerts);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [formData, setFormData] = useState({
    device_name: '',
    severity: 'medium',
    type: 'battery_low',
    message: '',
    timestamp: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, alertId: null });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await alertsAPI.getAll();
      setAlerts(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      showSnackbar('Failed to load alerts', 'error');
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

  const handleAcknowledge = async (alertId) => {
    try {
      await alertsAPI.acknowledge(alertId);
      showSnackbar('Alert acknowledged successfully');
      await loadAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      showSnackbar('Failed to acknowledge alert', 'error');
    }
  };

  const handleOpenDialog = (alert = null) => {
    if (alert) {
      setEditMode(true);
      setCurrentAlert(alert);
      setFormData({
        device_name: alert.device_name,
        severity: alert.severity,
        type: alert.type,
        message: alert.message,
        timestamp: alert.timestamp ? alert.timestamp.slice(0, 16) : '',
      });
    } else {
      setEditMode(false);
      setCurrentAlert(null);
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFormData({
        device_name: '',
        severity: 'medium',
        type: 'battery_low',
        message: '',
        timestamp: localDateTime,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentAlert(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        timestamp: formData.timestamp ? new Date(formData.timestamp).toISOString() : new Date().toISOString(),
      };

      if (editMode && currentAlert) {
        await alertsAPI.update(currentAlert.id, submitData);
        showSnackbar('Alert updated successfully');
      } else {
        await alertsAPI.create(submitData);
        showSnackbar('Alert created successfully');
      }
      handleCloseDialog();
      loadAlerts();
    } catch (error) {
      console.error('Failed to save alert:', error);
      showSnackbar('Failed to save alert', 'error');
    }
  };

  const handleOpenDeleteDialog = (alertId) => {
    setDeleteDialog({ open: true, alertId });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, alertId: null });
  };

  const handleDelete = async () => {
    try {
      await alertsAPI.delete(deleteDialog.alertId);
      showSnackbar('Alert deleted successfully');
      handleCloseDeleteDialog();
      loadAlerts();
    } catch (error) {
      console.error('Failed to delete alert:', error);
      showSnackbar('Failed to delete alert', 'error');
    }
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return { color: 'error', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'high':
        return { color: 'warning', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'medium':
        return { color: 'info', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' };
      case 'low':
        return { color: 'success', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' };
      default:
        return { color: 'default', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)' };
    }
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
              Alerts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor and manage system alerts and notifications
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ height: 'fit-content' }}
          >
            Add Alert
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {alerts.map((alert, index) => {
            const config = getSeverityConfig(alert.severity);
            return (
              <Zoom in={true} key={alert.id} style={{ transitionDelay: `${index * 50}ms` }}>
                <Card
                  sx={{
                    background: config.bg,
                    border: `1px solid ${config.border}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: config.bg,
                          border: `2px solid ${config.border}`,
                        }}
                      >
                        <WarningIcon color={config.color} />
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, alignItems: 'center' }}>
                          <Typography variant="h6" fontWeight={600}>
                            {alert.device_name}
                          </Typography>
                          <Chip
                            label={alert.severity.toUpperCase()}
                            color={config.color}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={alert.type.replace('_', ' ').toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                          {alert.message}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                        </Box>

                        {alert.acknowledged && (
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 1,
                              px: 2,
                              py: 1,
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: 2,
                            }}
                          >
                            <CheckIcon fontSize="small" color="success" />
                            <Typography variant="caption" color="success.main" fontWeight={600}>
                              Acknowledged by {alert.acknowledged_by_name || 'User'}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignSelf: 'flex-start' }}>
                        {!alert.acknowledged && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleOpenDialog(alert)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleOpenDeleteDialog(alert.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            );
          })}
        </Box>

        {alerts.length === 0 && (
          <Card sx={{ p: 8, textAlign: 'center' }}>
            <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              All Clear
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No alerts at this time. System operating normally.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create Test Alert
            </Button>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? 'Edit Alert' : 'Create New Alert'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Device Name"
                name="device_name"
                value={formData.device_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Alert Type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="battery_low">Battery Low</MenuItem>
                    <MenuItem value="signal_lost">Signal Lost</MenuItem>
                    <MenuItem value="geo_fence">Geo Fence</MenuItem>
                    <MenuItem value="speed_limit">Speed Limit</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="offline">Offline</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <TextField
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                required
              />
              <TextField
                label="Timestamp"
                name="timestamp"
                type="datetime-local"
                value={formData.timestamp}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this alert? This action cannot be undone.
            </Typography>
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