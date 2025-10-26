import React from 'react';
import {
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Badge,
  Chip,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';

const DeviceListPanel = ({
  open,
  devices,
  selectedDevice,
  onClose,
  onDeviceSelect
}) => {
  const theme = useTheme();

  const getDeviceStatus = (device) => {
    if (device.status !== 'active') return 'inactive';
    const lastSeen = new Date(device.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / 1000 / 60;
    if (diffMinutes > 10) return 'offline';
    return 'online';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      default: return 'default';
    }
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

  return (
    <Slide direction="right" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          bottom: 16,
          left: 16,
          zIndex: 999,
          width: 320,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Devices ({devices.length})
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
          {devices.map((device) => {
            const status = getDeviceStatus(device);
            return (
              <ListItem key={device.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={selectedDevice === device.id}
                  onClick={() => onDeviceSelect(device.id)}
                  sx={{
                    borderRadius: 1.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                    }
                  }}
                >
                  <ListItemIcon>
                    <Badge
                      badgeContent=""
                      color={getStatusColor(status)}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          animation: status === 'online' ? 'pulse 2s infinite' : 'none',
                        },
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                        }
                      }}
                    >
                      <MyLocationIcon color={status === 'online' ? 'success' : 'disabled'} />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {device.unit_name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          icon={getBatteryIcon(device.battery_level)}
                          label={`${device.battery_level}%`}
                          size="small"
                          color={getBatteryColor(device.battery_level)}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {device.device_code}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Slide>
  );
};

// Import battery icons at the top of the file
import {
  Battery20 as BatteryLowIcon,
  Battery50 as BatteryMedIcon,
  Battery80 as BatteryHighIcon,
  BatteryFull as BatteryFullIcon,
} from '@mui/icons-material';
import { Slide } from '@mui/material';

export default DeviceListPanel;