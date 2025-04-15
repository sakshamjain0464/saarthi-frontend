import React from 'react';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon issue in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapComponent = ({ locations = [], isVisible, onClose }) => {
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center of India
  const [zoom, setZoom] = useState(5);
  const [mobileMapVisible, setMobileMapVisible] = useState(false);

  useEffect(() => {
    // If locations are provided, center the map on the first location
    if (locations.length > 0) {
      setMapCenter([locations[0].lat, locations[0].lng]);
      setZoom(locations.length === 1 ? 10 : 5);
    }
  }, [locations]);

  // Toggle mobile map visibility
  const toggleMobileMap = () => {
    setMobileMapVisible(!mobileMapVisible);
  };

  // Close mobile map
  const closeMobileMap = () => {
    setMobileMapVisible(false);
  };

  return (
    <>
      {/* Desktop map section */}
      <div className="map-section">
        <div className={`map-container ${isVisible ? 'visible' : ''}`}>
          <div className="map-header">
            <h3>Trip Map</h3>
            <button className="map-close-btn" onClick={onClose}>
              ×
            </button>
          </div>
          <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location, index) => (
              <Marker key={index} position={[location.lat, location.lng]}>
                <Popup>
                  {location.name}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Mobile map bubble */}
      <div className="map-bubble" onClick={toggleMobileMap}>
        <MapPin />
      </div>

      {/* Mobile map popup */}
      <div className={`mobile-map-popup ${mobileMapVisible ? 'visible' : ''}`}>
        <div className="mobile-map-content">
          <div className="map-header">
            <h3>Trip Map</h3>
            <button className="map-close-btn" onClick={closeMobileMap}>
              ×
            </button>
          </div>
          <MapContainer center={mapCenter} zoom={zoom} style={{ height: 'calc(100% - 40px)', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location, index) => (
              <Marker key={index} position={[location.lat, location.lng]}>
                <Popup>
                  {location.name}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </>
  );
};

export default MapComponent;