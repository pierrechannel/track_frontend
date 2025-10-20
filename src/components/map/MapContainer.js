import React, { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { 
  Box, 
  Typography, 
  Chip, 
  Card, 
  CardContent, 
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Battery20, 
  Battery50, 
  Battery80, 
  BatteryFull,
  LocationOn,
  SignalCellularAlt 
} from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map invalidation
function MapInvalidator() {
  const map = useMap();
  
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  
  return null;
}

// Custom tile layer with modern style
const ModernTileLayer = () => (
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    maxZoom={19}
  />
);

// Battery icon component
const BatteryIcon = ({ level }) => {
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
const StatusChip = ({ status }) => {
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

export default function MapContainer({ devices, locations, onDeviceClick, selectedDevice }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [popupOpen, setPopupOpen] = useState(null);
  const center = [-3.3731, 29.3644]; // Bujumbura

  const createCustomIcon = (device, isSelected) => {
    const getStatusColor = () => {
      if (isSelected) return theme.palette.primary.main;
      
      switch (device.status) {
        case 'active':
          return theme.palette.success.main;
        case 'warning':
          return theme.palette.warning.main;
        case 'error':
          return theme.palette.error.main;
        default:
          return theme.palette.grey[500];
      }
    };

    const color = getStatusColor();
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: ${isSelected ? '40px' : '32px'};
          height: ${isSelected ? '40px' : '32px'};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '14px' : '12px'};
          color: white;
          font-weight: bold;
          transition: all 0.3s ease;
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
        ">
          ${device.unit_name.charAt(0).toUpperCase()}
        </div>
      `,
      iconSize: isSelected ? [40, 40] : [32, 32],
      iconAnchor: isSelected ? [20, 20] : [16, 16],
    });
  };

  const handlePopupOpen = (deviceId) => {
    setPopupOpen(deviceId);
  };

  const handlePopupClose = () => {
    setPopupOpen(null);
  };

  const getDeviceStatus = (device) => {
    if (device.battery_level < 20) return 'error';
    if (device.battery_level < 40) return 'warning';
    return device.status || 'active';
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
      <LeafletMap
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
        zoomControl={!isMobile}
      >
        <MapInvalidator />
        <ModernTileLayer />
        
        {devices.map((device) => {
          const location = locations.find(l => l.device === device.id);
          if (!location) return null;
          
          const deviceStatus = getDeviceStatus(device);
          const isSelected = selectedDevice === device.id;
          const isPopupOpen = popupOpen === device.id;

          return (
            <Marker
              key={device.id}
              position={[location.latitude, location.longitude]}
              icon={createCustomIcon({ ...device, status: deviceStatus }, isSelected)}
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
                      minWidth: 250,
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
                        
                        {device.last_update && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Last Update
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {new Date(device.last_update).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>
      
      {/* Map attribution footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '4px 8px',
          borderRadius: 1,
          zIndex: 1000,
        }}
      >
        <Typography variant="caption" color="text.secondary">
        </Typography>
      </Box>
    </Box>
  );
}