import React, { useState } from 'react';
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
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background */}
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          top: -250,
          left: -250,
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.5 },
            '50%': { opacity: 0.8 },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: -250,
          right: -250,
          animation: 'pulse 4s ease-in-out infinite 2s',
        }}
      />

      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  mb: 2,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  animation: 'glow 2s ease-in-out infinite',
                  '@keyframes glow': {
                    '0%, 100%': {
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                    },
                    '50%': {
                      boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)',
                    },
                  },
                }}
              >
                <SecurityIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                MIL-TRACK
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Secure Military Tracking System
              </Typography>
            </Box>

            <Card
              sx={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    required
                    autoFocus
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3, py: 1.5 }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                {/* <StatusIcon sx={{ color: 'success.main', fontSize: 10 }} /> */}
                <Typography variant="caption" color="text.secondary">
                  Authorized Personnel Only
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
