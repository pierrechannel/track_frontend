import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Avatar,
  Fade,
  InputAdornment,
  IconButton,
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  MilitaryTech,
} from '@mui/icons-material';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  // Particle background effect
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(59, 130, 246, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
      `;
      
      const container = document.querySelector('.login-container');
      if (container) {
        container.appendChild(particle);
        
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        
        const animation = particle.animate([
          { 
            transform: 'translateY(0px)',
            opacity: 0 
          },
          { 
            transform: `translateY(${Math.random() * 100 - 50}px) translateX(${Math.random() * 100 - 50}px)`,
            opacity: 0.8 
          },
          { 
            transform: `translateY(${Math.random() * 200 - 100}px) translateX(${Math.random() * 200 - 100}px)`,
            opacity: 0 
          }
        ], {
          duration: 3000 + Math.random() * 2000,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        });
        
        animation.onfinish = () => {
          particle.remove();
        };
      }
    };

    const interval = setInterval(createParticle, 200);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/map');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      className="login-container"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c4a6e 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
          `,
          animation: 'gradientShift 8s ease-in-out infinite',
          '@keyframes gradientShift': {
            '0%, 100%': {
              opacity: 1,
            },
            '50%': {
              opacity: 0.8,
            },
          },
        },
      }}
    >
      {/* Enhanced animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          top: -300,
          left: -300,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { 
              transform: 'translateY(0px) scale(1)',
              opacity: 0.3 
            },
            '50%': { 
              transform: 'translateY(20px) scale(1.05)',
              opacity: 0.5 
            },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: -300,
          right: -300,
          animation: 'float 6s ease-in-out infinite 3s',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Fade in={true} timeout={1000}>
          <Box>
            <Box 
              sx={{ 
                textAlign: 'center', 
                mb: 4,
                animation: 'slideDown 0.8s ease-out',
                '@keyframes slideDown': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-30px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  margin: '0 auto',
                  mb: 3,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
                  animation: 'glow 3s ease-in-out infinite, rotate 10s linear infinite',
                  '@keyframes glow': {
                    '0%, 100%': {
                      boxShadow: `
                        0 0 20px rgba(59, 130, 246, 0.4),
                        0 0 40px rgba(139, 92, 246, 0.2)
                      `,
                    },
                    '50%': {
                      boxShadow: `
                        0 0 30px rgba(59, 130, 246, 0.6),
                        0 0 60px rgba(139, 92, 246, 0.4),
                        0 0 80px rgba(16, 185, 129, 0.2)
                      `,
                    },
                  },
                  '@keyframes rotate': {
                    '0%': {
                      transform: 'rotate(0deg)',
                    },
                    '100%': {
                      transform: 'rotate(360deg)',
                    },
                  },
                }}
              >
                <MilitaryTech sx={{ fontSize: 44 }} />
              </Avatar>
              <Typography
                variant="h2"
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 30%, #10b981 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  letterSpacing: '0.1em',
                }}
              >
                MIL-TRACK
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{
                  background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                }}
              >
                {/* Secure Military Tracking System */}
              </Typography>
            </Box>

            <Zoom in={true} timeout={800} style={{ transitionDelay: '300ms' }}>
              <Card
                sx={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(25px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  boxShadow: `
                    0 25px 50px -12px rgba(0, 0, 0, 0.5),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `,
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981)',
                  },
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 3,
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#fecaca',
                          borderRadius: 2,
                          '& .MuiAlert-icon': {
                            color: '#f87171',
                          },
                        }}
                      >
                        {error}
                      </Alert>
                    )}

                    <TextField
                      fullWidth
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      margin="normal"
                      required
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person 
                              sx={{ 
                                color: focusedField === 'username' ? '#3b82f6' : '#64748b',
                                transition: 'color 0.3s ease',
                              }} 
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          background: 'rgba(30, 41, 59, 0.5)',
                          '&:hover': {
                            background: 'rgba(30, 41, 59, 0.7)',
                          },
                          '&.Mui-focused': {
                            background: 'rgba(30, 41, 59, 0.8)',
                            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      margin="normal"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock 
                              sx={{ 
                                color: focusedField === 'password' ? '#3b82f6' : '#64748b',
                                transition: 'color 0.3s ease',
                              }} 
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClickShowPassword}
                              edge="end"
                              sx={{ 
                                color: focusedField === 'password' ? '#3b82f6' : '#64748b',
                                '&:hover': {
                                  background: 'rgba(59, 130, 246, 0.1)',
                                },
                              }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          background: 'rgba(30, 41, 59, 0.5)',
                          '&:hover': {
                            background: 'rgba(30, 41, 59, 0.7)',
                          },
                          '&.Mui-focused': {
                            background: 'rgba(30, 41, 59, 0.8)',
                            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                      }}
                    />

                    <Tooltip title="Access secure military tracking system" arrow>
                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{
                          mt: 4,
                          py: 1.5,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          letterSpacing: '0.05em',
                          boxShadow: `
                            0 4px 15px rgba(59, 130, 246, 0.4),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2)
                          `,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `
                              0 8px 25px rgba(59, 130, 246, 0.6),
                              inset 0 1px 0 rgba(255, 255, 255, 0.2)
                            `,
                            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                          },
                          '&:active': {
                            transform: 'translateY(0)',
                          },
                          '&.Mui-disabled': {
                            background: 'rgba(100, 116, 139, 0.5)',
                          },
                        }}
                      >
                        {loading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} sx={{ color: 'white' }} />
                            <span>Authenticating...</span>
                          </Box>
                        ) : (
                          'Secure Sign In'
                        )}
                      </Button>
                    </Tooltip>
                  </form>
                </CardContent>
              </Card>
            </Zoom>

            <Fade in={true} timeout={1500} style={{ transitionDelay: '800ms' }}>
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 1.5,
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <SecurityIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: '#10b981',
                      animation: 'pulse 2s ease-in-out infinite',
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                    }}
                  >
                    CLASSIFIED - AUTHORIZED PERSONNEL ONLY
                  </Typography>
                </Box>
              </Box>
            </Fade>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}