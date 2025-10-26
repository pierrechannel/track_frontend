import React from 'react';
import {
  Paper,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { Slide } from '@mui/material';

const FiltersPanel = ({
  open,
  statusFilter,
  missionFilter,
  showTrails,
  missions,
  onClose,
  onStatusFilterChange,
  onMissionFilterChange,
  onShowTrailsChange,
  onResetFilters
}) => {
  const theme = useTheme();

  return (
    <Slide direction="down" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          left: 250,
          zIndex: 1000,
          p: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderRadius: 2,
          minWidth: 300,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Device Status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            size="small"
            fullWidth
          >
            <MenuItem value="all">All Devices</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
          </TextField>

          <TextField
            select
            label="Mission"
            value={missionFilter}
            onChange={(e) => onMissionFilterChange(e.target.value)}
            size="small"
            fullWidth
          >
            <MenuItem value="all">All Missions</MenuItem>
            {missions.map((mission) => (
              <MenuItem key={mission.id} value={mission.id}>
                {mission.name}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={showTrails}
                onChange={(e) => onShowTrailsChange(e.target.checked)}
                size="small"
              />
            }
            label="Show Movement Trails"
          />

          <Button
            variant="outlined"
            size="small"
            onClick={onResetFilters}
            sx={{ mt: 1 }}
          >
            Reset Filters
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
};

export default FiltersPanel;