import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircleOutline as AcknowledgeIcon,
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('timestamp');
  const [order, setOrder] = useState('desc');

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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (orderBy === 'timestamp') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedAlerts = sortedAlerts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

        {alerts.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
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
          </Paper>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'device_name'}
                        direction={orderBy === 'device_name' ? order : 'asc'}
                        onClick={() => handleRequestSort('device_name')}
                      >
                        Device
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'severity'}
                        direction={orderBy === 'severity' ? order : 'asc'}
                        onClick={() => handleRequestSort('severity')}
                      >
                        Severity
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'type'}
                        direction={orderBy === 'type' ? order : 'asc'}
                        onClick={() => handleRequestSort('type')}
                      >
                        Type
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'timestamp'}
                        direction={orderBy === 'timestamp' ? order : 'asc'}
                        onClick={() => handleRequestSort('timestamp')}
                      >
                        Timestamp
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAlerts.map((alert) => (
                    <TableRow key={alert.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {alert.device_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                          sx={{ fontWeight: 600, minWidth: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.type.replace('_', ' ').toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {alert.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(alert.timestamp).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {alert.acknowledged ? (
                          <Tooltip title={`Acknowledged by ${alert.acknowledged_by_name || 'User'}`}>
                            <Chip
                              icon={<CheckIcon />}
                              label="Acknowledged"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          <Chip
                            label="Pending"
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {!alert.acknowledged && (
                            <Tooltip title="Acknowledge">
                              <IconButton
                                size="small"
                                onClick={() => handleAcknowledge(alert.id)}
                                color="success"
                              >
                                <AcknowledgeIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(alert)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(alert.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={alerts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
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