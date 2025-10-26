import React, { useState, useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Box, Card, CardContent, Typography, Fade, useTheme, useMediaQuery, Button, IconButton, Tooltip } from '@mui/material';
import { LocationOn, SignalCellularAlt, Download, Straighten } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapInvalidator, ModernTileLayer } from './MapHelpers';
import { BatteryIcon, StatusChip } from './MapComponents';
import { createCustomIcon, getDeviceStatus, calculateDistance, exportToCSV } from './MapUtils';

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
        distance: distance.toFixed(2)
      };
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
        distance: distance.toFixed(2),
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

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      position: 'relative',
      borderRadius: isMobile ? 0 : 2,
      overflow: 'hidden',
      boxShadow: theme.shadows[3]
    }}>
      {/* Control Panel */}
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
        <Tooltip title="Export to CSV">
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            size="small"
            sx={{
              backgroundColor: 'white',
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.grey[100]
              },
              boxShadow: theme.shadows[2]
            }}
          >
            Export
          </Button>
        </Tooltip>
        
        <Tooltip title={showDistances ? "Hide distances" : "Show distances"}>
          <Button
            variant="contained"
            startIcon={<Straighten />}
            onClick={() => setShowDistances(!showDistances)}
            size="small"
            sx={{
              backgroundColor: showDistances ? theme.palette.primary.main : 'white',
              color: showDistances ? 'white' : theme.palette.primary.main,
              '&:hover': {
                backgroundColor: showDistances ? theme.palette.primary.dark : theme.palette.grey[100]
              },
              boxShadow: theme.shadows[2]
            }}
          >
            Distance
          </Button>
        </Tooltip>
      </Box>

      {/* Device Legend - Shows all devices with their unique colors */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.97)',
          padding: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          maxHeight: isMobile ? '250px' : '450px',
          overflowY: 'auto',
          minWidth: isMobile ? '200px' : '280px',
          maxWidth: isMobile ? '200px' : '320px',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} mb={1.5} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `2px solid ${theme.palette.divider}`,
          pb: 1
        }}>
          <span>Devices ({devices.length})</span>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            backgroundColor: theme.palette.success.main,
            animation: 'pulse 2s infinite'
          }} />
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {deviceDistances.map((device, index) => {
            const config = getDeviceConfig(device);
            const isSelected = selectedDevice === device.id;
            const deviceStatus = getDeviceStatus(device);
            
            return (
              <Box 
                key={device.id}
                onClick={() => onDeviceClick(device.id)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  padding: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? `${config.color}15` : 'transparent',
                  border: `2px solid ${isSelected ? config.color : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: `${config.color}10`,
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Box sx={{ 
                  minWidth: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`,
                  border: '2px solid white',
                  boxShadow: `0 2px 8px ${config.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {config.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isSelected ? 700 : 600,
                      color: theme.palette.text.primary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.85rem'
                    }}
                  >
                    {device.device_name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      display: 'block',
                      fontSize: '0.7rem'
                    }}
                  >
                    {device.device_code}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-end',
                  gap: 0.5
                }}>
                  {device.distance && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 700,
                        color: config.color,
                        fontSize: '0.7rem'
                      }}
                    >
                      {device.distance}km
                    </Typography>
                  )}
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    backgroundColor: deviceStatus === 'active' ? theme.palette.success.main :
                                   deviceStatus === 'warning' ? theme.palette.warning.main :
                                   deviceStatus === 'error' ? theme.palette.error.main :
                                   theme.palette.grey[400]
                  }} />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <LeafletMap
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
        zoomControl={!isMobile}
      >
        <MapInvalidator />
        <ModernTileLayer />
        
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
              weight={2}
              opacity={0.6}
              dashArray="5, 10"
            />
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
                      minWidth: 280,
                      border: `2px solid ${
                        isSelected ? theme.palette.primary.main : theme.palette.grey[200]
                      }`,
                      boxShadow: theme.shadows[8]
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOn 
                          sx={{ 
                            color: theme.palette.primary.main, 
                            mr: 1 
                          }} 
                        />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            color: theme.palette.text.primary
                          }}
                        >
                          {device.unit_name}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Device Code
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            {device.device_code}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            IMEI
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            {device.imei}
                          </Typography>
                        </Box>

                        {device.unit_name && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Unit
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {device.unit_name}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Status
                          </Typography>
                          <StatusChip status={deviceStatus} />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Battery
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BatteryIcon level={device.battery_level} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600,
                                color: device.battery_level < 20 
                                  ? theme.palette.error.main 
                                  : theme.palette.text.primary
                              }}
                            >
                              {device.battery_level}%
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
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

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Distance from center
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {device.distance} km
                          </Typography>
                        </Box>

                        {distanceToSelected && (
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            pt: 1,
                            borderTop: `1px solid ${theme.palette.divider}`
                          }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Distance to selected
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                              {distanceToSelected.distance} km
                            </Typography>
                          </Box>
                        )}
                        
                        {device.last_seen && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Last Seen
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {new Date(device.last_seen).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          pt: 1,
                          borderTop: `1px solid ${theme.palette.divider}`
                        }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Coordinates
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
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
      
      {/* Map info footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '6px 12px',
          borderRadius: 1,
          zIndex: 1000,
        }}
      >
        <Typography variant="caption" fontWeight={600} color="text.primary">
          Total Devices: {devices.length} | Active: {devices.filter(d => getDeviceStatus(d) === 'active').length}
        </Typography>
      </Box>
    </Box>
  );
}