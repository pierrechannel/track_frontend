import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Avatar,
  Fade,
  Grow,
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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrackChanges as MissionIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Devices as DevicesIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MyLocation as LocationIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { missionsAPI, devicesAPI } from '../services/api';

export default function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMission, setCurrentMission] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planned',
    start_date: '',
    end_date: '',
    commander_name: '',
    device_ids: [],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, missionId: null });
  const [trackDialog, setTrackDialog] = useState({ open: false, mission: null, locations: [] });
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    loadMissions();
    loadDevices();
  }, []);

  const loadMissions = async () => {
    try {
      const response = await missionsAPI.getAll();
      setMissions(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load missions:', error);
      showSnackbar('Failed to load missions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async () => {
    try {
      const response = await devicesAPI.getAll();
      setDevices(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (mission = null) => {
    if (mission) {
      setEditMode(true);
      setCurrentMission(mission);
      setFormData({
        name: mission.name,
        description: mission.description,
        status: mission.status,
        start_date: mission.start_date ? mission.start_date.slice(0, 16) : '',
        end_date: mission.end_date ? mission.end_date.slice(0, 16) : '',
        commander_name: mission.commander_name || '',
        device_ids: mission.device_ids || [],
      });
    } else {
      setEditMode(false);
      setCurrentMission(null);
      setFormData({
        name: '',
        description: '',
        status: 'planned',
        start_date: '',
        end_date: '',
        commander_name: '',
        device_ids: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentMission(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDeviceSelection = (e) => {
    setFormData({ ...formData, device_ids: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        devices: formData.device_ids,
      };

      if (editMode && currentMission) {
        await missionsAPI.update(currentMission.id, submitData);
        showSnackbar('Mission updated successfully');
      } else {
        await missionsAPI.create(submitData);
        showSnackbar('Mission created successfully');
      }
      handleCloseDialog();
      loadMissions();
    } catch (error) {
      console.error('Failed to save mission:', error);
      showSnackbar('Failed to save mission', 'error');
    }
  };

  const handleOpenDeleteDialog = (missionId) => {
    setDeleteDialog({ open: true, missionId });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, missionId: null });
  };

  const handleDelete = async () => {
    try {
      await missionsAPI.delete(deleteDialog.missionId);
      showSnackbar('Mission deleted successfully');
      handleCloseDeleteDialog();
      loadMissions();
    } catch (error) {
      console.error('Failed to delete mission:', error);
      showSnackbar('Failed to delete mission', 'error');
    }
  };

  const handleTrackMission = async (mission) => {
    setTrackDialog({ open: true, mission, locations: [] });
    setTrackLoading(true);
    try {
      const response = await missionsAPI.track(mission.id);
      setTrackDialog({ open: true, mission, locations: response.data });
    } catch (error) {
      console.error('Failed to track mission:', error);
      showSnackbar('Failed to load tracking data', 'error');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleCloseTrackDialog = () => {
    setTrackDialog({ open: false, mission: null, locations: [] });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'planned': return 'info';
      case 'completed': return 'warning';
      case 'aborted': return 'error';
      default: return 'default';
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
              Missions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage military operations in real-time
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ height: 'fit-content' }}
          >
            Add Mission
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {missions.map((mission, index) => (
            <Grow in={true} key={mission.id} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          width: 56,
                          height: 56,
                        }}
                      >
                        <MissionIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {mission.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mission.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={mission.status.toUpperCase()}
                        color={getStatusColor(mission.status)}
                        sx={{ fontWeight: 600 }}
                      />
                      {mission.status === 'active' && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LocationIcon />}
                          onClick={() => handleTrackMission(mission)}
                        >
                          Track
                        </Button>
                      )}
                      <IconButton size="small" onClick={() => handleOpenDialog(mission)} color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenDeleteDialog(mission.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          background: 'rgba(59, 130, 246, 0.05)',
                          border: '1px solid rgba(59, 130, 246, 0.1)',
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarIcon fontSize="small" color="primary" />
                          <Typography variant="caption" color="text.secondary">
                            Start Date
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(mission.start_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(mission.start_date).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Grid>

                    {mission.end_date && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Box
                          sx={{
                            background: 'rgba(139, 92, 246, 0.05)',
                            border: '1px solid rgba(139, 92, 246, 0.1)',
                            borderRadius: 2,
                            p: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <TimeIcon fontSize="small" color="secondary" />
                            <Typography variant="caption" color="text.secondary">
                              End Date
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(mission.end_date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(mission.end_date).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          background: 'rgba(16, 185, 129, 0.05)',
                          border: '1px solid rgba(16, 185, 129, 0.1)',
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon fontSize="small" color="success" />
                          <Typography variant="caption" color="text.secondary">
                            Commander
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {mission.commander_name || 'Unassigned'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Mission Lead
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          background: 'rgba(245, 158, 11, 0.05)',
                          border: '1px solid rgba(245, 158, 11, 0.1)',
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <DevicesIcon fontSize="small" color="warning" />
                          <Typography variant="caption" color="text.secondary">
                            Deployed Units
                          </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700}>
                          {mission.device_count || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Active Devices
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {mission.status === 'active' && (
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                          },
                        }}
                      />
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        Mission in Progress
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grow>
          ))}
        </Box>

        {missions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MissionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No missions found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click "Add Mission" to create your first mission
            </Typography>
          </Box>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editMode ? 'Edit Mission' : 'Add New Mission'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Mission Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    fullWidth
                  >
                    <MenuItem value="planned">Planned</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="aborted">Aborted</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Commander Name"
                    name="commander_name"
                    value={formData.commander_name}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <TextField
                select
                label="Assign Devices"
                name="device_ids"
                value={formData.device_ids}
                onChange={handleDeviceSelection}
                fullWidth
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const device = devices.find(d => d.id === value);
                        return device ? (
                          <Chip key={value} label={device.unit_name} size="small" />
                        ) : null;
                      })}
                    </Box>
                  ),
                }}
              >
                {devices.map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    {device.unit_name} ({device.device_code})
                  </MenuItem>
                ))}
              </TextField>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Date & Time"
                    name="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="End Date & Time"
                    name="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Track Mission Dialog */}
        <Dialog open={trackDialog.open} onClose={handleCloseTrackDialog} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocationIcon color="primary" />
              Track Mission: {trackDialog.mission?.name}
            </Box>
          </DialogTitle>
          <DialogContent>
            {trackLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Device Locations
                </Typography>
                {trackDialog.locations.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)' }}>
                          <TableCell><strong>Device</strong></TableCell>
                          <TableCell><strong>Latitude</strong></TableCell>
                          <TableCell><strong>Longitude</strong></TableCell>
                          <TableCell><strong>Altitude</strong></TableCell>
                          <TableCell><strong>Speed</strong></TableCell>
                          <TableCell><strong>Last Update</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trackDialog.locations.map((location) => (
                          <TableRow key={location.id} hover>
                            <TableCell>{location.device_name || `Device #${location.device}`}</TableCell>
                            <TableCell>{location.latitude?.toFixed(6)}</TableCell>
                            <TableCell>{location.longitude?.toFixed(6)}</TableCell>
                            <TableCell>{location.altitude ? `${location.altitude}m` : 'N/A'}</TableCell>
                            <TableCell>{location.speed ? `${location.speed} km/h` : 'N/A'}</TableCell>
                            <TableCell>{new Date(location.timestamp).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <LocationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No location data available for this mission
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTrackDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this mission? This action cannot be undone and will affect all associated data.
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