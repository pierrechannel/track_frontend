import L from 'leaflet';

// Device type icons mapping - each type has its own icon
const DEVICE_ICONS = {
  vehicle: '🚗',
  truck: '🚚',
  bus: '🚌',
  motorcycle: '🏍️',
  bicycle: '🚲',
  boat: '⛵',
  ship: '🚢',
  aircraft: '✈️',
  helicopter: '🚁',
  drone: '🛸',
  person: '👤',
  personnel: '👷',
  package: '📦',
  container: '📦',
  equipment: '⚙️',
  tool: '🔧',
  animal: '🐾',
  pet: '🐕',
  phone: '📱',
  tablet: '💻',
  watch: '⌚',
  tracker: '📍',
  sensor: '📡',
  camera: '📷',
  robot: '🤖',
  default: '📍'
};

// Generate unique color for each device based on device ID
export const generateUniqueColor = (deviceId) => {
  // Create a hash from the device ID (works with UUID)
  let hash = 0;
  const str = String(deviceId);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate vibrant HSL color with good contrast
  const hue = Math.abs(hash % 360);
  const saturation = 70 + (Math.abs(hash >> 8) % 20); // 70-90%
  const lightness = 45 + (Math.abs(hash >> 16) % 20); // 45-65%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Get device icon based on device_code or device_name patterns
export const getDeviceIcon = (device) => {
  // Check if device has a custom icon property
  if (device.icon) return device.icon;
  
  // Try to determine icon from device_code or device_name
  const searchText = `${device.device_code} ${device.device_name}`.toLowerCase();
  
  // Search for keywords in device info
  for (const [key, icon] of Object.entries(DEVICE_ICONS)) {
    if (searchText.includes(key)) {
      return icon;
    }
  }
  
  // Default icon
  return DEVICE_ICONS.default;
};

// Get device configuration (icon and unique color)
export const getDeviceConfig = (device) => {
  return {
    icon: getDeviceIcon(device),
    color: generateUniqueColor(device.id),
    name: device.device_name,
    code: device.device_code
  };
};

// Create custom icon for map markers with unique colors
export const createCustomIcon = (device, isSelected, theme) => {
  const config = getDeviceConfig(device);
  const size = isSelected ? 48 : 40;
  const iconSize = isSelected ? '24px' : '20px';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <div style="
          background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%);
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3), 0 0 0 ${isSelected ? '4px' : '0px'} ${config.color}40;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${iconSize};
          transition: all 0.3s ease;
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
        ">
          ${config.icon}
        </div>
        ${isSelected ? `
          <div style="
            position: absolute;
            top: -6px;
            right: -6px;
            width: 18px;
            height: 18px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          ">
            ✓
          </div>
        ` : ''}
        ${isSelected ? `
          <div style="
            position: absolute;
            bottom: -28px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${config.color};
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            border: 2px solid white;
          ">
            ${config.name}
          </div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.3); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Export location data to CSV with device information
export const exportToCSV = (devices, locations) => {
  const headers = [
    'Device ID',
    'Device Code', 
    'Device Name',
    'IMEI',
    'Unit Code',
    'Unit Name',
    'Latitude',
    'Longitude',
    'Battery %',
    'Status',
    'Last Seen',
    'Distance (km)',
    'Assigned To'
  ];
  
  const rows = devices.map(device => {
    const location = locations.find(l => l.device === device.id);
    return [
      device.id,
      device.device_code || 'N/A',
      device.device_name || 'N/A',
      device.imei || 'N/A',
      device.unit_code || 'N/A',
      device.unit_name || 'N/A',
      location?.latitude || 'N/A',
      location?.longitude || 'N/A',
      device.battery_level || 0,
      device.status || 'active',
      device.last_seen || 'N/A',
      device.distance || 'N/A',
      device.assigned_to_name || 'N/A'
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `gps_devices_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Get device status based on battery level and status
export const getDeviceStatus = (device) => {
  if (device.battery_level < 20) return 'error';
  if (device.battery_level < 40) return 'warning';
  return device.status || 'active';
};