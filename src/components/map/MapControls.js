import React from 'react';
import {
  Paper,
  Typography,
  IconButton,
  Chip,
  Divider,
  Button,
  FormControlLabel,
  Switch,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Map as MapIcon,
} from '@mui/icons-material';

const MapControls = ({
  deviceStatusCounts,
  showDeviceList,
  showFilters,
  autoRefresh,
  lastRefresh,
  onToggleDeviceList,
  onToggleFilters,
  onManualRefresh,
  onAutoRefreshChange
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        p: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(20px)',
        borderRadius: 2,
        minWidth: 200,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Map Controls
        </Typography>
        
        {/* Status Overview */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            icon={<MyLocationIcon />}
            label={`${deviceStatusCounts.online} Online`}
            size="small"
            color="success"
            sx={{ fontWeight: 600 }}
          />
          <Chip 
            label={`${deviceStatusCounts.offline} Offline`}
            size="small"
            color="error"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Divider />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant={showDeviceList ? 'contained' : 'outlined'}
            startIcon={<MapIcon />}
            onClick={onToggleDeviceList}
            size="small"
          >
            Device List
          </Button>
          <Button
            fullWidth
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterIcon />}
            onClick={onToggleFilters}
            size="small"
          >
            Filters
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onManualRefresh}
            size="small"
          >
            Refresh
          </Button>
        </Box>

        {/* Auto-refresh toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={autoRefresh}
              onChange={(e) => onAutoRefreshChange(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="caption">
              Auto-refresh (30s)
            </Typography>
          }
        />

        {/* Last refresh time */}
        <Typography variant="caption" color="text.secondary">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default MapControls;