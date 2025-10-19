export const UserRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMMANDER: 'COMMANDER',
  OPERATOR: 'OPERATOR',
  OBSERVER: 'OBSERVER',
  DEVICE: 'DEVICE'
};

export const DeviceStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance'
};

export const MissionStatus = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABORTED: 'aborted'
};

export const AlertType = {
  GEOFENCE: 'geofence',
  SPEED: 'speed',
  SOS: 'sos',
  DEVIATION: 'deviation',
  LOW_BATTERY: 'low_battery',
  OFFLINE: 'offline'
};

export const AlertSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};