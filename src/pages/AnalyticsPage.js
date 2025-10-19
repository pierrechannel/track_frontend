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
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Devices as DevicesIcon,
  CheckCircle as ActiveIcon,
  TrackChanges as MissionIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import { devicesAPI, missionsAPI } from '../services/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalMissions: 0,
    activeMissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [devicesRes, missionsRes] = await Promise.all([
        devicesAPI.getAll(),
        missionsAPI.getAll(),
      ]);

      const devices = devicesRes.data.results || devicesRes.data;
      const missions = missionsRes.data.results || missionsRes.data;

      setStats({
        totalDevices: devices.length,
        activeDevices: devices.filter((d) => d.status === 'active').length,
        totalMissions: missions.length,
        activeMissions: missions.filter((m) => m.status === 'active').length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
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
  ];

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
            Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time system statistics and performance metrics
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={12} sm={6} lg={3} key={stat.title}>
                <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Avatar
                          sx={{
                            background: stat.gradient,
                            width: 56,
                            height: 56,
                          }}
                        >
                          <Icon />
                        </Avatar>
                        <Typography
                          variant="h3"
                          fontWeight={700}
                          sx={{
                            animation: 'pulse 3s infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.7 },
                            },
                          }}
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {stat.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <TrendingIcon fontSize="small" color="success" />
                        <Typography variant="caption" color="success.main" fontWeight={600}>
                          Live
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>

        {/* System Health Overview */}
        <Card>
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
                      System Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          animation: 'pulse 2s infinite',
                        }}
                      />
                      <Typography variant="body2" color="success.main" fontWeight={700}>
                        Operational
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    All systems running normally
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card sx={{ mt: 3, p: 8, textAlign: 'center' }}>
          <TrendingIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Advanced Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Detailed analytics and reporting features including historical data, performance trends,
            and predictive insights will be available in this section.
          </Typography>
        </Card>
      </Box>
    </Fade>
  );
}
