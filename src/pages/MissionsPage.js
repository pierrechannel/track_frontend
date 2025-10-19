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
} from '@mui/material';
import {
  TrackChanges as MissionIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Devices as DevicesIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { missionsAPI } from '../services/api';

export default function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const response = await missionsAPI.getAll();
      setMissions(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setLoading(false);
    }
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Missions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage military operations in real-time
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {missions.map((mission, index) => (
            <Grow in={true} key={mission.id} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          width: 56,
                          height: 56,
                        }}
                      >
                        <MissionIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {mission.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mission.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={mission.status.toUpperCase()}
                      color={getStatusColor(mission.status)}
                      sx={{ fontWeight: 600 }}
                    />
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
                          {mission.commander_name}
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
                          {mission.device_count}
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
          </Box>
        )}
      </Box>
    </Fade>
  );
}