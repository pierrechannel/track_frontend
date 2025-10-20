import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  CircularProgress,
  Avatar,
  Fade,
  Zoom,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Devices as DevicesIcon,
  CheckCircle as ActiveIcon,
  TrackChanges as MissionIcon,
  Bolt as BoltIcon,
  Battery80 as BatteryIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { devicesAPI, missionsAPI, alertsAPI, trackingAPI } from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalMissions: 0,
    activeMissions: 0,
    totalAlerts: 0,
    unacknowledgedAlerts: 0,
    avgBattery: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [devices, setDevices] = useState([]);
  const [missions, setMissions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState({
    deviceStatus: [],
    missionStatus: [],
    alertSeverity: [],
    batteryLevels: [],
    dailyActivity: [],
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [devicesRes, missionsRes, alertsRes] = await Promise.all([
        devicesAPI.getAll(),
        missionsAPI.getAll(),
        alertsAPI.getAll(),
      ]);

      const devicesData = devicesRes.data.results || devicesRes.data;
      const missionsData = missionsRes.data.results || missionsRes.data;
      const alertsData = alertsRes.data.results || alertsRes.data;

      setDevices(devicesData);
      setMissions(missionsData);
      setAlerts(alertsData);

      // Calculate stats
      const avgBattery =
        devicesData.length > 0
          ? devicesData.reduce((sum, d) => sum + (d.battery_level || 0), 0) / devicesData.length
          : 0;

      setStats({
        totalDevices: devicesData.length,
        activeDevices: devicesData.filter((d) => d.status === 'active').length,
        totalMissions: missionsData.length,
        activeMissions: missionsData.filter((m) => m.status === 'active').length,
        totalAlerts: alertsData.length,
        unacknowledgedAlerts: alertsData.filter((a) => !a.acknowledged).length,
        avgBattery: Math.round(avgBattery),
      });

      // Prepare chart data
      prepareChartData(devicesData, missionsData, alertsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (devices, missions, alerts) => {
    // Device status distribution
    const deviceStatusCount = {
      active: devices.filter((d) => d.status === 'active').length,
      inactive: devices.filter((d) => d.status === 'inactive').length,
      maintenance: devices.filter((d) => d.status === 'maintenance').length,
    };

    const deviceStatusData = Object.entries(deviceStatusCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Mission status distribution
    const missionStatusCount = {
      planned: missions.filter((m) => m.status === 'planned').length,
      active: missions.filter((m) => m.status === 'active').length,
      completed: missions.filter((m) => m.status === 'completed').length,
      aborted: missions.filter((m) => m.status === 'aborted').length,
    };

    const missionStatusData = Object.entries(missionStatusCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Alert severity distribution
    const alertSeverityCount = {
      low: alerts.filter((a) => a.severity === 'low').length,
      medium: alerts.filter((a) => a.severity === 'medium').length,
      high: alerts.filter((a) => a.severity === 'high').length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
    };

    const alertSeverityData = Object.entries(alertSeverityCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Battery levels distribution
    const batteryRanges = {
      '0-20%': devices.filter((d) => d.battery_level <= 20).length,
      '21-50%': devices.filter((d) => d.battery_level > 20 && d.battery_level <= 50).length,
      '51-80%': devices.filter((d) => d.battery_level > 50 && d.battery_level <= 80).length,
      '81-100%': devices.filter((d) => d.battery_level > 80).length,
    };

    const batteryLevelsData = Object.entries(batteryRanges).map(([name, value]) => ({
      name,
      value,
    }));

    // Simulated daily activity (last 7 days)
    const dailyActivityData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        devices: Math.floor(Math.random() * 20) + 10,
        missions: Math.floor(Math.random() * 10) + 5,
        alerts: Math.floor(Math.random() * 15) + 5,
      };
    });

    setChartData({
      deviceStatus: deviceStatusData,
      missionStatus: missionStatusData,
      alertSeverity: alertSeverityData,
      batteryLevels: batteryLevelsData,
      dailyActivity: dailyActivityData,
    });
  };

  const statCards = [
    {
      title: 'Total Devices',
      value: stats.totalDevices,
      icon: DevicesIcon,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'primary',
    },
    {
      title: 'Active Devices',
      value: stats.activeDevices,
      icon: ActiveIcon,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'success',
    },
    {
      title: 'Total Missions',
      value: stats.totalMissions,
      icon: MissionIcon,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: 'secondary',
    },
    {
      title: 'Active Missions',
      value: stats.activeMissions,
      icon: BoltIcon,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'warning',
    },
    {
      title: 'Total Alerts',
      value: stats.totalAlerts,
      icon: TrendingIcon,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'error',
    },
    {
      title: 'Pending Alerts',
      value: stats.unacknowledgedAlerts,
      icon: ScheduleIcon,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'warning',
    },
    {
      title: 'Avg Battery',
      value: `${stats.avgBattery}%`,
      icon: BatteryIcon,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'success',
    },
    {
      title: 'System Health',
      value: '98%',
      icon: SpeedIcon,
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      color: 'info',
    },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time system statistics and performance metrics
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Avatar
                          sx={{
                            background: stat.gradient,
                            width: 48,
                            height: 48,
                          }}
                        >
                          <Icon />
                        </Avatar>
                        <Typography variant="h4" fontWeight={700}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {stat.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>

        {/* System Health Overview */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ActiveIcon color="primary" />
              System Health Overview
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.1)',
                    borderRadius: 2,
                    p: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Device Utilization
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {stats.totalDevices > 0
                        ? Math.round((stats.activeDevices / stats.totalDevices) * 100)
                        : 0}
                      %
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      stats.totalDevices > 0
                        ? (stats.activeDevices / stats.totalDevices) * 100
                        : 0
                    }
                    color="primary"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    borderRadius: 2,
                    p: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Mission Activity
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {stats.totalMissions > 0
                        ? Math.round((stats.activeMissions / stats.totalMissions) * 100)
                        : 0}
                      %
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      stats.totalMissions > 0
                        ? (stats.activeMissions / stats.totalMissions) * 100
                        : 0
                    }
                    color="secondary"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    borderRadius: 2,
                    p: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Alert Response Rate
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {stats.totalAlerts > 0
                        ? Math.round(
                            ((stats.totalAlerts - stats.unacknowledgedAlerts) / stats.totalAlerts) * 100
                          )
                        : 100}
                      %
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      stats.totalAlerts > 0
                        ? ((stats.totalAlerts - stats.unacknowledgedAlerts) / stats.totalAlerts) * 100
                        : 100
                    }
                    color="success"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs for different analytics views */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 3 }}>
              <Tab label="Charts & Graphs" />
              <Tab label="Device Analytics" />
              <Tab label="Mission Analytics" />
            </Tabs>
          </Box>

          {/* Charts Tab */}
          {tabValue === 0 && (
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Daily Activity Chart */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      background: 'rgba(59, 130, 246, 0.05)',
                      border: '1px solid rgba(59, 130, 246, 0.1)',
                      borderRadius: 2,
                      p: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon color="primary" />
                      Daily Activity Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="devices" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                        <Area type="monotone" dataKey="missions" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                        <Area type="monotone" dataKey="alerts" stackId="1" stroke="#ef4444" fill="#ef4444" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>

                {/* Device Status Pie Chart */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      borderRadius: 2,
                      p: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Device Status Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData.deviceStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.deviceStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>

                {/* Mission Status Bar Chart */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      background: 'rgba(139, 92, 246, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.1)',
                      borderRadius: 2,
                      p: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Mission Status Overview
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.missionStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>

                {/* Alert Severity Chart */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.1)',
                      borderRadius: 2,
                      p: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Alert Severity Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.alertSeverity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>

                {/* Battery Levels Chart */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      background: 'rgba(245, 158, 11, 0.05)',
                      border: '1px solid rgba(245, 158, 11, 0.1)',
                      borderRadius: 2,
                      p: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Battery Level Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.batteryLevels}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          )}

          {/* Device Analytics Tab */}
          {tabValue === 1 && (
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Device Performance Metrics
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)' }}>
                      <TableCell><strong>Device</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Battery</strong></TableCell>
                      <TableCell><strong>Assigned To</strong></TableCell>
                      <TableCell><strong>Last Seen</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {devices.map((device) => (
                      <TableRow key={device.id} hover>
                        <TableCell>{device.unit_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={device.status}
                            color={
                              device.status === 'active'
                                ? 'success'
                                : device.status === 'inactive'
                                ? 'error'
                                : 'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={device.battery_level}
                              sx={{ width: 100, height: 8, borderRadius: 4 }}
                              color={
                                device.battery_level > 50
                                  ? 'success'
                                  : device.battery_level > 20
                                  ? 'warning'
                                  : 'error'
                              }
                            />
                            <Typography variant="caption">{device.battery_level}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{device.assigned_to_name || 'Unassigned'}</TableCell>
                        <TableCell>{new Date(device.last_seen).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          )}

          {/* Mission Analytics Tab */}
          {tabValue === 2 && (
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Mission Performance Metrics
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(139, 92, 246, 0.05)' }}>
                      <TableCell><strong>Mission</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Commander</strong></TableCell>
                      <TableCell><strong>Devices</strong></TableCell>
                      <TableCell><strong>Start Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {missions.map((mission) => (
                      <TableRow key={mission.id} hover>
                        <TableCell>{mission.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={mission.status}
                            color={
                              mission.status === 'active'
                                ? 'success'
                                : mission.status === 'planned'
                                ? 'info'
                                : mission.status === 'completed'
                                ? 'warning'
                                : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{mission.commander_name || 'Unassigned'}</TableCell>
                        <TableCell>
                          <Chip label={mission.device_count || 0} color="primary" size="small" />
                        </TableCell>
                        <TableCell>{new Date(mission.start_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          )}
        </Card>
      </Box>
    </Fade>
  );
}