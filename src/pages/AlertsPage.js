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
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { alertsAPI } from '../services/api';
import { useStore } from '../store/useStore';

export default function AlertsPage() {
  const alerts = useStore((state) => state.alerts);
  const setAlerts = useStore((state) => state.setAlerts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await alertsAPI.getAll();
      setAlerts(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await alertsAPI.acknowledge(alertId);
      await loadAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Alerts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage system alerts and notifications
          </Typography>
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
                              Acknowledged by {alert.acknowledged_by_name}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {!alert.acknowledged && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleAcknowledge(alert.id)}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          Acknowledge
                        </Button>
                      )}
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
            <Typography variant="body2" color="text.secondary">
              No alerts at this time. System operating normally.
            </Typography>
          </Card>
        )}
      </Box>
    </Fade>
  );
}