import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Collapse,
  Avatar,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Shield,
  PersonAdd,
  Edit,
  Delete,
  Search,
  MoreVert,
  CheckCircle,
  Cancel,
  Lock,
  Phone,
  Email,
  People,
  Visibility,
  Settings,
  Warning,
} from '@mui/icons-material';

// Mock API
const usersAPI = {
  getAll: async () => ({
    data: [
      {
        id: '1',
        username: 'admin',
        email: 'admin@system.mil',
        role: 'SUPER_ADMIN',
        phone_number: '+257 79 123 456',
        clearance_level: 5,
        two_factor_enabled: true,
        is_active: true,
        last_login: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        username: 'commander1',
        email: 'commander@system.mil',
        role: 'COMMANDER',
        phone_number: '+257 79 234 567',
        clearance_level: 4,
        two_factor_enabled: true,
        is_active: true,
        last_login: '2024-01-15T09:15:00Z',
      },
      {
        id: '3',
        username: 'operator1',
        email: 'operator@system.mil',
        role: 'OPERATOR',
        phone_number: '+257 79 345 678',
        clearance_level: 3,
        two_factor_enabled: false,
        is_active: true,
        last_login: '2024-01-14T16:45:00Z',
      },
      {
        id: '4',
        username: 'observer1',
        email: 'observer@system.mil',
        role: 'OBSERVER',
        phone_number: '+257 79 456 789',
        clearance_level: 2,
        two_factor_enabled: false,
        is_active: true,
        last_login: '2024-01-13T14:20:00Z',
      },
    ],
  }),
  create: async (data) => ({ data: { ...data, id: Date.now().toString(), is_active: true } }),
  update: async (id, data) => ({ data: { ...data, id } }),
  delete: async (id) => ({ data: { success: true } }),
};

const roleConfig = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    color: 'error',
    description: 'Full system access and control',
  },
  COMMANDER: {
    label: 'Commander',
    color: 'warning',
    description: 'Mission command and coordination',
  },
  OPERATOR: {
    label: 'Operator',
    color: 'info',
    description: 'Device operation and monitoring',
  },
  OBSERVER: {
    label: 'Observer',
    color: 'success',
    description: 'Read-only access',
  },
  DEVICE: {
    label: 'Device',
    color: 'secondary',
    description: 'Automated device account',
  },
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUserId, setMenuUserId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'OBSERVER',
    phone_number: '',
    clearance_level: 1,
    two_factor_enabled: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersAPI.getAll();
      const usersData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.phone_number && user.phone_number.includes(term))
      );
    }

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    if (mode === 'edit' && user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        phone_number: user.phone_number || '',
        clearance_level: user.clearance_level,
        two_factor_enabled: user.two_factor_enabled || false,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'OBSERVER',
        phone_number: '',
        clearance_level: 1,
        two_factor_enabled: false,
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (dialogMode === 'create') {
        const response = await usersAPI.create(formData);
        setUsers([...users, response.data]);
        setSuccess('User created successfully!');
      } else {
        const response = await usersAPI.update(selectedUser.id, formData);
        setUsers(users.map((u) => (u.id === selectedUser.id ? response.data : u)));
        setSuccess('User updated successfully!');
      }
      handleCloseDialog();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save user:', err);
      setError('Failed to save user. Please try again.');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.delete(userId);
        setUsers(users.filter((u) => u.id !== userId));
        setSuccess('User deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Failed to delete user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
    handleCloseMenu();
  };

  const handleMenuOpen = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuUserId(null);
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    superAdmins: users.filter((u) => u.role === 'SUPER_ADMIN').length,
    commanders: users.filter((u) => u.role === 'COMMANDER').length,
    operators: users.filter((u) => u.role === 'OPERATOR').length,
    observers: users.filter((u) => u.role === 'OBSERVER').length,
    twoFactorEnabled: users.filter((u) => u.two_factor_enabled).length,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users, roles, and permissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => handleOpenDialog('create')}
            sx={{ textTransform: 'none' }}
          >
            Add User
          </Button>
        </Box>

        {/* Alerts */}
        <Collapse in={!!error}>
          <Alert
            severity="error"
            icon={<Warning />}
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        </Collapse>
        <Collapse in={!!success}>
          <Alert
            severity="success"
            icon={<CheckCircle />}
            onClose={() => setSuccess(null)}
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        </Collapse>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Avatar sx={{ bgcolor: 'info.light' }}>
                    <People />
                  </Avatar>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.active}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Active Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Avatar sx={{ bgcolor: 'error.light' }}>
                    <Shield />
                  </Avatar>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.superAdmins}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Super Admins
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    <Lock />
                  </Avatar>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.twoFactorEnabled}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  2FA Enabled
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Paper>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Users" sx={{ textTransform: 'none' }} />
            <Tab label="Role Distribution" sx={{ textTransform: 'none' }} />
          </Tabs>

          {/* Users List Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              {/* Filters */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1, minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Role Filter</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role Filter"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Roles</MenuItem>
                    {Object.keys(roleConfig).map((role) => (
                      <MenuItem key={role} value={role}>
                        {roleConfig[role].label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Users Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Clearance</TableCell>
                      <TableCell>2FA</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                          <Typography color="text.secondary">No users found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: `${roleConfig[user.role]?.color}.light` }}>
                                {user.username.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {user.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={roleConfig[user.role]?.label || user.role}
                              color={roleConfig[user.role]?.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {user.phone_number && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">{user.phone_number}</Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<Shield sx={{ fontSize: 16 }} />}
                              label={`Level ${user.clearance_level}`}
                              size="small"
                              color={user.clearance_level >= 4 ? 'error' : user.clearance_level >= 3 ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {user.two_factor_enabled ? (
                              <Chip
                                icon={<Lock sx={{ fontSize: 16 }} />}
                                label="Enabled"
                                size="small"
                                color="success"
                              />
                            ) : (
                              <Chip label="Disabled" size="small" variant="outlined" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.is_active ? 'Active' : 'Inactive'}
                              size="small"
                              color={user.is_active ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton onClick={(e) => handleMenuOpen(e, user.id)}>
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Role Distribution Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {Object.entries(roleConfig).map(([roleKey, config]) => {
                  const count = users.filter((u) => u.role === roleKey).length;
                  const percentage = users.length > 0 ? ((count / users.length) * 100).toFixed(1) : 0;

                  return (
                    <Grid item xs={12} md={6} key={roleKey}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box display="flex" gap={2}>
                              <Avatar sx={{ bgcolor: `${config.color}.light`, width: 56, height: 56 }}>
                                <Shield sx={{ fontSize: 32 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight="bold">
                                  {config.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {config.description}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="h3" fontWeight="bold" color={`${config.color}.main`}>
                              {count}
                            </Typography>
                          </Box>
                          <Box mt={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2" color="text.secondary">
                                Percentage of total users
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {percentage}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={parseFloat(percentage)}
                              color={config.color}
                              sx={{ height: 8, borderRadius: 1 }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          <MenuItem
            onClick={() => {
              const user = users.find((u) => u.id === menuUserId);
              handleOpenDialog('edit', user);
              handleCloseMenu();
            }}
          >
            <Edit sx={{ mr: 1, fontSize: 20 }} />
            Edit User
          </MenuItem>
          <MenuItem
            onClick={() => handleDelete(menuUserId)}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1, fontSize: 20 }} />
            Delete User
          </MenuItem>
        </Menu>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' ? 'Create New User' : 'Edit User'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Username"
                  required
                  fullWidth
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                <TextField
                  label="Email"
                  type="email"
                  required
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {dialogMode === 'create' && (
                  <TextField
                    label="Password"
                    type="password"
                    required
                    fullWidth
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                )}
                <TextField
                  label="Phone Number"
                  placeholder="+257 XX XXX XXX"
                  fullWidth
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    {Object.entries(roleConfig).map(([key, config]) => (
                      <MenuItem key={key} value={key}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Clearance Level</InputLabel>
                  <Select
                    value={formData.clearance_level}
                    label="Clearance Level"
                    onChange={(e) => setFormData({ ...formData, clearance_level: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map((level) => (
                      <MenuItem key={level} value={level}>
                        Level {level} {level >= 4 && '(High Security)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.two_factor_enabled}
                      onChange={(e) => setFormData({ ...formData, two_factor_enabled: e.target.checked })}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {dialogMode === 'create' ? 'Create User' : 'Save Changes'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Box>
  );
}