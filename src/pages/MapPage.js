import React, { useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { useStore } from '../store/useStore';
import { wsClient } from '../services/websocket';
import MapContainer from '../components/map/MapContainer';
import MapControls from '../components/map/MapControls';
import FiltersPanel from '../components/map/FiltersPanel';
import DeviceListPanel from '../components/map/DeviceListPanel';
import DeviceInfoPanel from '../components/map/DeviceInfoPanel';
import StatisticsCard from '../components/map/StatisticsCard';
import LoadingScreen from '../components/map/LoadingScreen';
import { useMapData } from '../hooks/useMapData';

export default function MapPage() {
  const theme = useTheme();
  const {
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
    loadInitialData
  } = useMapData();

  const selectedDeviceData = devices.find(d => d.id === selectedDevice);
  const selectedLocation = selectedDevice ? locations.get(selectedDevice) : null;

  useEffect(() => {
    loadInitialData();

    const handleLocationUpdate = (location) => {
      // Location updates are handled in the store via useMapData hook
    };

    wsClient.on('location', handleLocationUpdate);

    return () => {
      wsClient.off('location', handleLocationUpdate);
    };
  }, [autoRefresh]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      {/* Map Controls Overlay - Top Left */}
      <MapControls
        deviceStatusCounts={deviceStatusCounts}
        showDeviceList={showDeviceList}
        showFilters={showFilters}
        autoRefresh={autoRefresh}
        lastRefresh={lastRefresh}
        onToggleDeviceList={() => setShowDeviceList(!showDeviceList)}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onManualRefresh={handleManualRefresh}
        onAutoRefreshChange={setAutoRefresh}
      />

      {/* Filters Panel */}
      <FiltersPanel
        open={showFilters}
        statusFilter={statusFilter}
        missionFilter={missionFilter}
        showTrails={showTrails}
        missions={missions}
        onClose={() => setShowFilters(false)}
        onStatusFilterChange={setStatusFilter}
        onMissionFilterChange={setMissionFilter}
        onShowTrailsChange={setShowTrails}
        onResetFilters={() => {
          setStatusFilter('all');
          setMissionFilter('all');
          setShowTrails(false);
        }}
      />

      {/* Device List Panel */}
      <DeviceListPanel
        open={showDeviceList}
        devices={filteredDevices}
        selectedDevice={selectedDevice}
        onClose={() => setShowDeviceList(false)}
        onDeviceSelect={setSelectedDevice}
      />

      {/* Map */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <MapContainer
          devices={filteredDevices}
          locations={Array.from(locations.values())}
          onDeviceClick={setSelectedDevice}
          selectedDevice={selectedDevice}
          showTrails={showTrails}
        />
      </Box>

      {/* Device Info Panel
      <DeviceInfoPanel
        device={selectedDeviceData}
        location={selectedLocation}
        onClose={() => setSelectedDevice(null)}
      /> */}

      {/* Statistics Card */}
      <StatisticsCard
        deviceStatusCounts={deviceStatusCounts}
        totalDevices={devices.length}
        hasDeviceSelected={Boolean(selectedDeviceData && selectedLocation)}
      />
    </Box>
  );
}