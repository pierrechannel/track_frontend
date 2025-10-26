import React, { useEffect } from 'react';
import { TileLayer, useMap } from 'react-leaflet';

// Component to handle map invalidation
export function MapInvalidator() {
  const map = useMap();
  
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  
  return null;
}

// Custom tile layer with modern style
export const ModernTileLayer = () => (
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    maxZoom={19}
  />
);