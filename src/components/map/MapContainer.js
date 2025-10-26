import React, { useState, useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { Box, Card, CardContent, Typography, Fade, useTheme, useMediaQuery, Button, IconButton, Tooltip, Chip, Avatar, Divider } from '@mui/material';
import { LocationOn, SignalCellularAlt, Download, Straighten, MyLocation, ZoomIn, FilterList, Layers } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapInvalidator, ModernTileLayer } from './MapHelpers';
import { BatteryIcon, StatusChip } from './MapComponents';
import { createCustomIcon, getDeviceStatus, calculateDistance, exportToCSV, getDeviceConfig } from './MapUtils';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapContainer({ devices, locations, onDeviceClick, selectedDevice }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [popupOpen, setPopupOpen] = useState(null);
  const [showDistances, setShowDistances] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const center = [-3.3731, 29.3644]; // Bujumbura

  // Calculate distances between all devices and center point
  const deviceDistances = useMemo(() => {
    return devices.map(device => {
      const location = locations.find(l => l.device === device.id);
      if (!location) return { ...device, distance: null };
      
      const distance = calculateDistance(
        center[0], center[1],
        location.latitude, location.longitude
      );
      
      return {
        ...device,
        distance: parseFloat(distance)
      };
    }).sort((a, b) => {
      // Sort by distance, nulls last
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }, [devices, locations]);

  // Calculate distance between selected device and others
  const selectedDeviceDistance = useMemo(() => {
    if (!selectedDevice) return null;
    
    const selected = locations.find(l => l.device === selectedDevice);
    if (!selected) return null;
    
    return devices.map(device => {
      if (device.id === selectedDevice) return null;
      const location = locations.find(l => l.device === device.id);
      if (!location) return null;
      
      const distance = calculateDistance(
        selected.latitude, selected.longitude,
        location.latitude, location.longitude
      );
      
      return {
        deviceId: device.id,
        distance: parseFloat(distance),
        position: [location.latitude, location.longitude]
      };
    }).filter(Boolean);
  }, [selectedDevice, devices, locations]);

  const handlePopupOpen = (deviceId) => {
    setPopupOpen(deviceId);
  };

  const handlePopupClose = () => {
    setPopupOpen(null);
  };

  const handleExport = () => {
    exportToCSV(deviceDistances, locations);
  };

  // Get status counts
  const statusCounts = useMemo(() => {
    const counts = { active: 0, warning: 0, error: 0, offline: 0 };
    devices.forEach(device => {
      const status = getDeviceStatus(device);
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [devices]);

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      position: 'relative',
      borderRadius: isMobile ? 0 : 2,
      overflow: 'hidden',
      boxShadow: theme.shadows[3]
    }}>
      {/* Enhanced Control Panel */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          gap: 1,
          flexDirection: 'column'
        }}
      >
        <Tooltip title="Toggle Legend" placement="left">
          <IconButton
            onClick={() => setShowLegend(!showLegend)}
            sx={{
              backgroundColor: showLegend ? theme.palette.primary.main : 'white',
              color: showLegend ? 'white' : theme.palette.primary.main,
              boxShadow: theme.shadows[3],
              '&:hover': {
                backgroundColor: showLegend ? theme.palette.primary.dark : theme.palette.grey[100],
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s'
            }}
          >
            <Layers />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export to CSV" placement="left">
          <IconButton
            onClick={handleExport}
            sx={{
              backgroundColor: 'white',
              color: theme.palette.primary.main,
              boxShadow: theme.shadows[3],
              '&:hover': {
                backgroundColor: theme.palette.grey[100],
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s'
            }}
          >
            <Download />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={showDistances ? "Hide distances" : "Show distances"} placement="left">
          <IconButton
            onClick={() => setShowDistances(!showDistances)}
            sx={{
              backgroundColor: showDistances ? theme.palette.primary.main : 'white',
              color: showDistances ? 'white' : theme.palette.primary.main,
              boxShadow: theme.shadows[3],
              '&:hover': {
                backgroundColor: showDistances ? theme.palette.primary.dark : theme.palette.grey[100],
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s'
            }}
          >
            <Straighten />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Enhanced Device Legend */}
      {showLegend && (
        <Fade in={showLegend}>
          <Card
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              maxHeight: isMobile ? '300px' : '500px',
              overflowY: 'auto',
              minWidth: isMobile ? '280px' : '320px',
              maxWidth: isMobile ? '280px' : '360px',
              boxShadow: theme.shadows[8],
              border: `1px solid ${theme.palette.divider}`,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.grey[100],
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.primary.main,
                borderRadius: '10px',
                '&:hover': {
                  background: theme.palette.primary.dark,
                }
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {/* Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MyLocation sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="h6" fontWeight={700}>
                    Devices
                  </Typography>
                  <Chip 
                    label={devices.length} 
                    size="small" 
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Box sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  backgroundColor: theme.palette.success.main,
                  boxShadow: `0 0 8px ${theme.palette.success.main}`,
                  animation: 'pulse 2s infinite'
                }} />
              </Box>

              {/* Status Summary */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                mb: 2,
                flexWrap: 'wrap'
              }}>
                <Chip 
                  icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.success.main }} />}
                  label={`Active: ${statusCounts.active || 0}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: theme.palette.success.main, color: theme.palette.success.main }}
                />
                <Chip 
                  icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.warning.main }} />}
                  label={`Warning: ${statusCounts.warning || 0}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: theme.palette.warning.main, color: theme.palette.warning.main }}
                />
                <Chip 
                  icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.error.main }} />}
                  label={`Error: ${statusCounts.error || 0}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: theme.palette.error.main, color: theme.palette.error.main }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Device List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {deviceDistances.map((device, index) => {
                  const config = getDeviceConfig(device);
                  const isSelected = selectedDevice === device.id;
                  const deviceStatus = getDeviceStatus(device);
                  
                  return (
                    <Card
                      key={device.id}
                      elevation={isSelected ? 4 : 1}
                      onClick={() => onDeviceClick(device.id)}
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: isSelected ? `${config.color}08` : 'white',
                        border: `2px solid ${isSelected ? config.color : 'transparent'}`,
                        borderRadius: 2,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
                        '&:hover': {
                          backgroundColor: `${config.color}05`,
                          transform: 'translateX(4px)',
                          boxShadow: theme.shadows[4]
                        }
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {/* Device Icon with Gradient */}
                          <Avatar sx={{ 
                            width: 40,
                            height: 40,
                            background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%)`,
                            border: '3px solid white',
                            boxShadow: `0 2px 12px ${config.color}40`,
                            fontSize: '20px'
                          }}>
                            {config.icon}
                          </Avatar>

                          {/* Device Info */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                mb: 0.25
                              }}
                            >
                              {device.device_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: theme.palette.text.secondary,
                                  fontFamily: 'monospace',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {device.device_code}
                              </Typography>
                              {device.distance && (
                                <Chip
                                  label={`${device.distance}km`}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    backgroundColor: `${config.color}20`,
                                    color: config.color,
                                    '& .MuiChip-label': { px: 1 }
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          {/* Status Indicator */}
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%',
                            backgroundColor: 
                              deviceStatus === 'active' ? theme.palette.success.main :
                              deviceStatus === 'warning' ? theme.palette.warning.main :
                              deviceStatus === 'error' ? theme.palette.error.main :
                              theme.palette.grey[400],
                            boxShadow: `0 0 8px ${
                              deviceStatus === 'active' ? theme.palette.success.main :
                              deviceStatus === 'warning' ? theme.palette.warning.main :
                              deviceStatus === 'error' ? theme.palette.error.main :
                              theme.palette.grey[400]
                            }`,
                            animation: deviceStatus === 'active' ? 'pulse 2s infinite' : 'none'
                          }} />
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}

      <LeafletMap
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
        zoomControl={!isMobile}
      >
        <MapInvalidator />
        <ModernTileLayer />
        
        {/* Center point marker */}
        <Circle
          center={center}
          radius={100}
          pathOptions={{
            color: theme.palette.primary.main,
            fillColor: theme.palette.primary.main,
            fillOpacity: 0.2,
            weight: 2
          }}
        />
        
        {/* Draw lines between selected device and others */}
        {showDistances && selectedDevice && selectedDeviceDistance?.map((dist) => {
          const selectedLoc = locations.find(l => l.device === selectedDevice);
          if (!selectedLoc) return null;
          
          return (
            <Polyline
              key={`line-${dist.deviceId}`}
              positions={[
                [selectedLoc.latitude, selectedLoc.longitude],
                dist.position
              ]}
              color={theme.palette.primary.main}
              weight={3}
              opacity={0.5}
              dashArray="10, 15"
            >
              <Popup>
                <Typography variant="caption" fontWeight={600}>
                  Distance: {dist.distance} km
                </Typography>
              </Popup>
            </Polyline>
          );
        })}
        
        {deviceDistances.map((device) => {
          const location = locations.find(l => l.device === device.id);
          if (!location) return null;
          
          const deviceStatus = getDeviceStatus(device);
          const isSelected = selectedDevice === device.id;
          const isPopupOpen = popupOpen === device.id;
          
          const distanceToSelected = selectedDeviceDistance?.find(d => d.deviceId === device.id);

          return (
            <Marker
              key={device.id}
              position={[location.latitude, location.longitude]}
              icon={createCustomIcon({ ...device, status: deviceStatus }, isSelected, theme)}
              eventHandlers={{
                click: () => onDeviceClick(device.id),
                popupopen: () => handlePopupOpen(device.id),
                popupclose: handlePopupClose,
              }}
            >
              <Popup
                closeButton={true}
                autoClose={false}
                closeOnEscapeKey={true}
                className="modern-popup"
              >
                <Fade in={isPopupOpen}>
                  <Card 
                    sx={{ 
                      minWidth: 300,
                      border: `3px solid ${isSelected ? theme.palette.primary.main : theme.palette.grey[200]}`,
                      boxShadow: theme.shadows[12],
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{
                      background: `linear-gradient(135deg, ${getDeviceConfig(device).color} 0%, ${getDeviceConfig(device).color}dd 100%)`,
                      p: 2,
                      color: 'white'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ 
                          width: 48, 
                          height: 48,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          fontSize: '24px'
                        }}>
                          {getDeviceConfig(device).icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                            {device.device_name}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            fontFamily: 'monospace',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            display: 'inline-block'
                          }}>
                            {device.device_code}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            IMEI
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            {device.imei}
                          </Typography>
                        </Box>

                        {device.unit_name && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                              Unit
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {device.unit_name}
                            </Typography>
                          </Box>
                        )}

                        <Divider />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Status
                          </Typography>
                          <StatusChip status={deviceStatus} />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Battery
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BatteryIcon level={device.battery_level} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 700,
                                color: device.battery_level < 20 
                                  ? theme.palette.error.main 
                                  : device.battery_level < 40
                                  ? theme.palette.warning.main
                                  : theme.palette.success.main
                              }}
                            >
                              {device.battery_level}%
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Signal
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SignalCellularAlt 
                              sx={{ 
                                fontSize: 18,
                                color: theme.palette.success.main 
                              }} 
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Good
                            </Typography>
                          </Box>
                        </Box>

                        <Divider />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Distance from center
                          </Typography>
                          <Chip
                            label={`${device.distance} km`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          />
                        </Box>

                        {distanceToSelected && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                              Distance to selected
                            </Typography>
                            <Chip
                              label={`${distanceToSelected.distance} km`}
                              size="small"
                              color="secondary"
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>
                        )}
                        
                        {device.last_seen && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                              Last Seen
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {new Date(device.last_seen).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        )}

                        <Divider />

                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          backgroundColor: theme.palette.grey[50],
                          p: 1,
                          borderRadius: 1
                        }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Coordinates
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            fontFamily: 'monospace',
                            fontWeight: 600 
                          }}>
                            {location.latitude}, {location.longitude}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>
      
      {/* Enhanced Map Info Footer */}
      <Card
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          px: 3,
          py: 1.5,
          boxShadow: theme.shadows[6],
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Total:
            </Typography>
            <Chip 
              label={devices.length} 
              size="small" 
              sx={{ 
                fontWeight: 700,
                backgroundColor: theme.palette.primary.main,
                color: 'white'
              }} 
            />
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Active:
            </Typography>
            <Chip 
              label={statusCounts.active || 0} 
              size="small" 
              sx={{ 
                fontWeight: 700,
                backgroundColor: theme.palette.success.main,
                color: 'white'
              }} 
            />
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Warning:
            </Typography>
            <Chip 
              label={statusCounts.warning || 0} 
              size="small" 
              sx={{ 
                fontWeight: 700,
                backgroundColor: theme.palette.warning.main,
                color: 'white'
              }} 
            />
          </Box>
        </Box>
      </Card>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { 
              opacity: 1; 
              transform: scale(1); 
            }
            50% { 
              opacity: 0.7; 
              transform: scale(1.1); 
            }
          }
        `}
      </style>
    </Box>
  );
}