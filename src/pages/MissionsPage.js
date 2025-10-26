import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Fade,
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
  TablePagination,
  TableSortLabel,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  TrackChanges as MissionIcon,
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
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('start_date');
  const [order, setOrder] = useState('desc');

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

  // Table sorting handlers
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'planned': return 'info';
      case 'completed': return 'warning';
      case 'aborted': return 'error';
      default: return 'default';
    }
  };

  // Sort missions
  const sortedMissions = [...missions].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (orderBy === 'start_date' || orderBy === 'end_date') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginate missions
  const paginatedMissions = sortedMissions.slice(
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

        {missions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MissionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No missions found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click "Add Mission" to create your first mission
            </Typography>
          </Box>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 650 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'name'}
                        direction={orderBy === 'name' ? order : 'asc'}
                        onClick={() => handleRequestSort('name')}
                      >
                        <strong>Mission Name</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <strong>Description</strong>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'status'}
                        direction={orderBy === 'status' ? order : 'asc'}
                        onClick={() => handleRequestSort('status')}
                      >
                        <strong>Status</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'start_date'}
                        direction={orderBy === 'start_date' ? order : 'asc'}
                        onClick={() => handleRequestSort('start_date')}
                      >
                        <strong>Start Date</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'end_date'}
                        direction={orderBy === 'end_date' ? order : 'asc'}
                        onClick={() => handleRequestSort('end_date')}
                      >
                        <strong>End Date</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'commander_name'}
                        direction={orderBy === 'commander_name' ? order : 'asc'}
                        onClick={() => handleRequestSort('commander_name')}
                      >
                        <strong>Commander</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Devices</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMissions.map((mission) => (
                    <TableRow key={mission.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {mission.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 250,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {mission.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={mission.status.toUpperCase()}
                          color={getStatusColor(mission.status)}
                          size="small"
                          sx={{ fontWeight: 600, minWidth: 90 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(mission.start_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(mission.start_date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {mission.end_date ? (
                          <>
                            <Typography variant="body2">
                              {new Date(mission.end_date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(mission.end_date).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {mission.commander_name || 'Unassigned'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={mission.device_count || 0}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {mission.status === 'active' && (
                            <Tooltip title="Track Mission">
                              <IconButton
                                size="small"
                                onClick={() => handleTrackMission(mission)}
                                color="success"
                              >
                                <LocationIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(mission)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(mission.id)}
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
              count={missions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
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