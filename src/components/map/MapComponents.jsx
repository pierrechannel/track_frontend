import React from 'react';
import { Chip, useTheme } from '@mui/material';
import { 
  Battery20, 
  Battery50, 
  Battery80, 
  BatteryFull
} from '@mui/icons-material';

// Battery icon component
export const BatteryIcon = ({ level }) => {
  const theme = useTheme();
  const getBatteryIcon = () => {
    if (level >= 80) return <BatteryFull sx={{ color: theme.palette.success.main }} />;
    if (level >= 60) return <Battery80 sx={{ color: theme.palette.success.light }} />;
    if (level >= 40) return <Battery50 sx={{ color: theme.palette.warning.main }} />;
    return <Battery20 sx={{ color: theme.palette.error.main }} />;
  };

  return getBatteryIcon();
};

// Status chip component
export const StatusChip = ({ status }) => {
  const theme = useTheme();
  
  const statusConfig = {
    active: {
      label: 'Active',
      color: 'success',
      variant: 'filled'
    },
    inactive: {
      label: 'Inactive',
      color: 'default',
      variant: 'outlined'
    },
    warning: {
      label: 'Warning',
      color: 'warning',
      variant: 'filled'
    },
    error: {
      label: 'Error',
      color: 'error',
      variant: 'filled'
    }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Chip 
      label={config.label}
      color={config.color}
      variant={config.variant}
      size="small"
      sx={{ 
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 24
      }}
    />
  );
};