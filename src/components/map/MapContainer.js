import React from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapContainer({ devices, locations, onDeviceClick, selectedDevice }) {
  const center = [-3.3731, 29.3644]; // Bujumbura
  
  const createCustomIcon = (device, isSelected) => {
    const color = device.status === 'active' ? (isSelected ? '#3b82f6' : '#10b981') : '#6b7280';
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          font-weight: bold;
        ">
          ${device.unit_name.charAt(0)}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <LeafletMap
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {devices.map((device) => {
        const location = locations.find(l => l.device === device.id);
        if (!location) return null;
        
        return (
          <Marker
            key={device.id}
            position={[location.latitude, location.longitude]}
            icon={createCustomIcon(device, selectedDevice === device.id)}
            eventHandlers={{
              click: () => onDeviceClick(device.id),
            }}
          >
            <Popup>
              <div className="font-medium">{device.unit_name}</div>
              <div className="text-sm text-gray-600">Battery: {device.battery_level}%</div>
            </Popup>
          </Marker>
        );
      })}
    </LeafletMap>
  );
}