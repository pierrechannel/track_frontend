import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Fade,
  alpha,
  useTheme
} from '@mui/material';

const LoadingScreen = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'background.default',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
      <Fade in timeout={800}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={70} 
            thickness={3}
            sx={{
              color: theme.palette.primary.main,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 3, 
              fontWeight: 500, 
              color: 'text.secondary',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Loading tactical map...
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1, 
              color: 'text.secondary',
              opacity: 0.8
            }}
          >
            Initializing real-time tracking system
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

export default LoadingScreen;