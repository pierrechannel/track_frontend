import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  CircularProgress,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Battery80 as BatteryIcon,
  SignalCellularAlt as SignalIcon,
  MyLocation as LocationIcon,
  Circle as StatusIcon,
} from '@mui/icons-material';
import { devicesAPI } from '../services/api';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await devicesAPI.getAll();
      setDevices(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getBatteryColor = (level) => {
    if (level > 50) return 'success';
    if (level > 20) return 'warning';
    return 'error';
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
            Devices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all tracking devices in real-time
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {devices.map((device, index) => (
            <Grid item xs={12} sm={6} lg={4} key={device.id}>
              <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {device.unit_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {device.device_code}
                        </Typography>
                      </Box>
                      <Chip
                        label={device.status}
                        color={getStatusColor(device.status)}
                        size="small"
                        icon={<StatusIcon />}
                      />
                    </Box>

                    <Box
                      sx={{
                        background: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BatteryIcon color={getBatteryColor(device.battery_level)} />
                          <Typography variant="body2">Battery</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {device.battery_level}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={device.battery_level}
                        color={getBatteryColor(device.battery_level)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SignalIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">Assigned to</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {device.assigned_to_name}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">
                        Last seen: {new Date(device.last_seen).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {devices.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DevicesIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No devices found
            </Typography>
          </Box>
        )}
      </Box>
    </Fade>
  );
}
