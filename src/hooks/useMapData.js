import { useState, useEffect } from 'react';
import { devicesAPI, missionsAPI } from '../services/api';
import { useStore } from '../store/useStore';

export const useMapData = () => {
  const [devices, setDevices] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [missionFilter, setMissionFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showTrails, setShowTrails] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const locations = useStore((state) => state.locations);
  const updateLocation = useStore((state) => state.updateLocation);
  const selectedDevice = useStore((state) => state.selectedDevice);
  const setSelectedDevice = useStore((state) => state.setSelectedDevice);

  const loadInitialData = async () => {
    try {
      await Promise.all([loadDevices(), loadMissions()]);
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async () => {
    try {
      const response = await devicesAPI.getAll();
      const devicesList = response.data.results || response.data;
      setDevices(devicesList);
      
      for (const device of devicesList) {
        try {
          const locResponse = await devicesAPI.getCurrentLocation(device.id);
          updateLocation(locResponse.data);
        } catch (err) {
          console.error(`Failed to load location for device ${device.id}`);
        }
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const loadMissions = async () => {
    try {
      const response = await missionsAPI.getAll();
      setMissions(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load missions:', error);
    }
  };

  const refreshDeviceLocations = async () => {
    try {
      for (const device of devices) {
        try {
          const locResponse = await devicesAPI.getCurrentLocation(device.id);
          updateLocation(locResponse.data);
        } catch (err) {
          console.error(`Failed to refresh location for device ${device.id}`);
        }
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh locations:', error);
    }
  };

  const handleManualRefresh = () => {
    refreshDeviceLocations();
  };

  const getDeviceStatus = (device) => {
    if (device.status !== 'active') return 'inactive';
    const lastSeen = new Date(device.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / 1000 / 60;
    if (diffMinutes > 10) return 'offline';
    return 'online';
  };

  // Filter devices based on selected filters
  const filteredDevices = devices.filter(device => {
    const statusMatch = statusFilter === 'all' || device.status === statusFilter;
    const missionMatch = missionFilter === 'all' || 
      missions.find(m => m.id === missionFilter)?.device_ids?.includes(device.id);
    return statusMatch && missionMatch;
  });

  // Count devices by status
  const deviceStatusCounts = {
    online: devices.filter(d => getDeviceStatus(d) === 'online').length,
    offline: devices.filter(d => getDeviceStatus(d) === 'offline').length,
    inactive: devices.filter(d => getDeviceStatus(d) === 'inactive').length,
  };

  // Auto-refresh effect
  useEffect(() => {
    let refreshInterval;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        refreshDeviceLocations();
      }, 30000);
    }
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh, devices]);

  return {
    devices,
    missions,
    loading,
    locations,
    selectedDevice,
    filteredDevices,
    deviceStatusCounts,
    showDeviceList,
    showFilters,
    statusFilter,
    missionFilter,
    autoRefresh,
    showTrails,
    lastRefresh,
    setSelectedDevice,
    setShowDeviceList,
    setShowFilters,
    setStatusFilter,
    setMissionFilter,
    setAutoRefresh,
    setShowTrails,
    handleManualRefresh,
    loadInitialData,
    getDeviceStatus
  };
};