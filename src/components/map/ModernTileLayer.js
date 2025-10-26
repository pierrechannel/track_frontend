import { TileLayer } from 'react-leaflet';

const ModernTileLayer = () => (
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    maxZoom={19}
  />
);

export default ModernTileLayer;