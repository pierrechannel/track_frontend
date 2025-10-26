import React from 'react';
import {
  Paper,
  Typography,
  IconButton,
  Button,
  LinearProgress,
  Grid,
  Divider,
  Chip,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Battery20 as BatteryLowIcon,
  Battery50 as BatteryMedIcon,
  Battery80 as BatteryHighIcon,
  BatteryFull as BatteryFullIcon,
  SignalCellularAlt as SignalIcon,
  Navigation as NavigationIcon,
  Timeline as TimelineIcon,
  CenterFocusStrong as CenterIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { Slide } from '@mui/material';

const DeviceInfoPanel = ({ device, location, onClose }) => {
  const theme = useTheme();

  if (!device || !location) return null;

  const getDeviceStatus = (device) => {
    if (device.status !== 'active') return 'inactive';
    const lastSeen = new Date(device.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / 1000 / 60;
    if (diffMinutes > 10) return 'offline';
    return 'online';
  };

  const getBatteryIcon = (level) => {
    if (level > 80) return <BatteryFullIcon />;
    if (level > 50) return <BatteryHighIcon />;
    if (level > 20) return <BatteryMedIcon />;
    return <BatteryLowIcon />;
  };

  const getBatteryColor = (level) => {
    if (level > 50) return 'success';
    if (level > 20) return 'warning';
    return 'error';
  };

  const status = getDeviceStatus(device);

  return (
    <Slide direction="left" in={Boolean(device && location)} mountOnEnter unmountOnExit>
      <Paper 
        elevation={0}
        sx={{ 
          width: 400, 
          p: 0,
          overflowY: 'auto',
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header with gradient */}
        <Box sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 3,
          pb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" sx={{ opacity: 0.9, fontSize: '0.7rem', letterSpacing: 1.5 }}>
                UNIT TRACKING
              </Typography>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1.5, mt: 0.5 }}>
                {device.unit_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<MyLocationIcon sx={{ fontSize: 16, color: 'inherit !important' }} />}
                  label={status.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: status === 'online' 
                      ? 'rgba(76, 175, 80, 0.2)' 
                      : 'rgba(244, 67, 54, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: status === 'online'
                      ? 'rgba(76, 175, 80, 0.5)'
                      : 'rgba(244, 67, 54, 0.5)',
                    '& .MuiChip-icon': {
                      color: 'inherit'
                    }
                  }}
                />
                {device.imei && (
                  <Chip 
                    label={device.imei}
                    size="small"
                    sx={{
                      bgcolor: alpha('#fff', 0.15),
                      color: 'white',
                      fontWeight: 600,
                      fontFamily: 'monospace',
                    }}
                  />
                )}
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ 
                color: 'white',
                bgcolor: alpha('#fff', 0.15),
                '&:hover': { 
                  bgcolor: alpha('#fff', 0.25),
                  transform: 'rotate(90deg)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TimelineIcon />}
              size="small"
            >
              History
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CenterIcon />}
              size="small"
            >
              Center
            </Button>
          </Box>

          {/* Battery Card */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5,
              bgcolor: alpha(theme.palette.background.default, 0.6),
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                  color: `${getBatteryColor(device.battery_level)}.main`,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {getBatteryIcon(device.battery_level)}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Battery Level
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: `${getBatteryColor(device.battery_level)}.main` }}>
                {device.battery_level}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={device.battery_level}
              color={getBatteryColor(device.battery_level)}
              sx={{ 
                height: 10, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.action.disabledBackground, 0.3),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${theme.palette[getBatteryColor(device.battery_level)].light}, ${theme.palette[getBatteryColor(device.battery_level)].main})`
                }
              }}
            />
          </Paper>

          {/* Location Stats */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5,
              bgcolor: alpha(theme.palette.background.default, 0.6),
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5 }}>
              Location Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 1.5, 
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                    Accuracy
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {location.accuracy?.toFixed(1)}m
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Signal Info */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5,
              bgcolor: alpha(theme.palette.background.default, 0.6),
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.12)
                  }}>
                    <SignalIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Signal Strength
                  </Typography>
                </Box>
                <Chip 
                  label={`${location.signal_strength || 0}/5`}
                  size="small"
                  sx={{ 
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main'
                  }}
                />
              </Box>
              <Divider sx={{ opacity: 0.6 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.success.main, 0.12)
                  }}>
                    <NavigationIcon sx={{ fontSize: 20, color: 'success.main' }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Satellites
                  </Typography>
                </Box>
                <Chip 
                  label={location.satellites || 0}
                  size="small"
                  sx={{ 
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    color: 'success.main'
                  }}
                />
              </Box>
            </Box>
          </Paper>

          {/* Device Assignment */}
          {device.assigned_to_name && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 2,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                Assigned To
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, color: 'info.main' }}>
                {device.assigned_to_name}
              </Typography>
            </Paper>
          )}

          {/* Last Update */}
          <Box sx={{ 
            textAlign: 'center', 
            mt: 1,
            p: 2,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.action.selected, 0.3)
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              Last updated
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.primary',
                fontWeight: 600,
                mt: 0.5,
                fontFamily: 'monospace'
              }}
            >
              {new Date(location.timestamp).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
};

export default DeviceInfoPanel;