import React, { useEffect, useState } from 'react';
import { devicesAPI } from '../services/api';
import { useStore } from '../store/useStore';
import { wsClient } from '../services/websocket';
import { Battery, Signal, Navigation } from 'lucide-react';
import MapContainer from '../components/map/MapContainer';

export default function MapPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const locations = useStore((state) => state.locations);
  const updateLocation = useStore((state) => state.updateLocation);
  const selectedDevice = useStore((state) => state.selectedDevice);
  const setSelectedDevice = useStore((state) => state.setSelectedDevice);

  useEffect(() => {
    loadDevices();

    // Listen for real-time location updates
    const handleLocationUpdate = (location) => {
      updateLocation(location);
    };

    wsClient.on('location', handleLocationUpdate);

    return () => {
      wsClient.off('location', handleLocationUpdate);
    };
  }, []);

  const loadDevices = async () => {
    try {
      const response = await devicesAPI.getAll();
      const devicesList = response.data.results || response.data;
      setDevices(devicesList);
      
      // Load current locations for all devices
      for (const device of devicesList) {
        try {
          const locResponse = await devicesAPI.getCurrentLocation(device.id);
          updateLocation(locResponse.data);
        } catch (err) {
          console.error(`Failed to load location for device ${device.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceStatus = (device) => {
    if (device.status !== 'active') return 'inactive';
    const lastSeen = new Date(device.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / 1000 / 60;
    if (diffMinutes > 10) return 'offline';
    return 'online';
  };

  const selectedDeviceData = devices.find(d => d.id === selectedDevice);
  const selectedLocation = selectedDevice ? locations.get(selectedDevice) : null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading tactical map...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          devices={devices}
          locations={Array.from(locations.values())}
          onDeviceClick={(deviceId) => setSelectedDevice(deviceId)}
          selectedDevice={selectedDevice}
        />
      </div>

      {/* Device Info Panel */}
      {selectedDeviceData && selectedLocation && (
        <div className="w-80 bg-gray-800 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{selectedDeviceData.unit_name}</h2>
            <button
              onClick={() => setSelectedDevice(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Status</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  getDeviceStatus(selectedDeviceData) === 'online' ? 'bg-green-500' :
                  getDeviceStatus(selectedDeviceData) === 'offline' ? 'bg-red-500' : 'bg-gray-500'
                } text-white`}>
                  {getDeviceStatus(selectedDeviceData)}
                </span>
              </div>
            </div>

            {/* Battery */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Battery size={18} className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Battery</span>
                </div>
                <span className="text-white font-medium">{selectedDeviceData.battery_level}%</span>
              </div>
              <div className="mt-2 bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    selectedDeviceData.battery_level > 50 ? 'bg-green-500' :
                    selectedDeviceData.battery_level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${selectedDeviceData.battery_level}%` }}
                />
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-gray-700 p-4 rounded-lg space-y-2">
              <h3 className="text-white font-medium mb-3">Location Data</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Latitude</span>
                  <p className="text-white">{selectedLocation.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Longitude</span>
                  <p className="text-white">{selectedLocation.longitude.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Altitude</span>
                  <p className="text-white">{selectedLocation.altitude.toFixed(1)}m</p>
                </div>
                <div>
                  <span className="text-gray-400">Speed</span>
                  <p className="text-white">{selectedLocation.speed.toFixed(1)} km/h</p>
                </div>
                <div>
                  <span className="text-gray-400">Heading</span>
                  <p className="text-white">{selectedLocation.heading.toFixed(0)}°</p>
                </div>
                <div>
                  <span className="text-gray-400">Accuracy</span>
                  <p className="text-white">{selectedLocation.accuracy.toFixed(1)}m</p>
                </div>
              </div>
            </div>

            {/* Signal Info */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Signal size={18} className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Signal</span>
                </div>
                <span className="text-white">{selectedLocation.signal_strength}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Navigation size={18} className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Satellites</span>
                </div>
                <span className="text-white">{selectedLocation.satellites}</span>
              </div>
            </div>

            {/* Last Update */}
            <div className="text-center text-gray-400 text-sm">
              Last update: {new Date(selectedLocation.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}