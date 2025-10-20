import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Battery80 as BatteryIcon,
  SignalCellularAlt as SignalIcon,
  MyLocation as LocationIcon,  // Correction ici
  Circle as StatusIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const DeviceCard = ({ device, onEdit, onDelete, onViewLocation }) => {
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

  return (
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
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton 
              size="small" 
              onClick={onViewLocation} 
              color="info"
              title="View Location"
            >
              <LocationIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onEdit} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDelete} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Chip
          label={device.status}
          color={getStatusColor(device.status)}
          size="small"
          icon={<StatusIcon />}
          sx={{ mb: 2 }}
        />

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
              {device.assigned_to_name || 'Unassigned'}
            </Typography>
          </Box>
          {device.imei && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">IMEI</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                {device.imei}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Last seen: {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DeviceCard;