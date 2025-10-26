import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  alpha,
  useTheme
} from '@mui/material';

const StatisticsCard = ({
  deviceStatusCounts,
  totalDevices,
  hasDeviceSelected
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: 16,
        right: hasDeviceSelected ? 416 : 16,
        zIndex: 1000,
        p: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(20px)',
        borderRadius: 2,
        minWidth: 300,
        transition: 'right 0.3s ease',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        System Overview
      </Typography>
      <Grid container spacing={1.5}>
        <Grid item xs={6}>
          <Card sx={{ 
            bgcolor: alpha(theme.palette.success.main, 0.08), 
            border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`
            }
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {deviceStatusCounts.online}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Online
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ 
            bgcolor: alpha(theme.palette.error.main, 0.08), 
            border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`
            }
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {deviceStatusCounts.offline}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Offline
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ 
            bgcolor: alpha(theme.palette.warning.main, 0.08), 
            border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.2)}`
            }
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {deviceStatusCounts.inactive}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Inactive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.08), 
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
            }
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {totalDevices}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StatisticsCard;