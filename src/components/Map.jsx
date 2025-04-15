import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { Icon } from 'leaflet';

const Map = ({ cities = [] }) => {
  const [mapReady, setMapReady] = useState(false);
  const defaultPosition = [20.5937, 78.9629]; // India's coordinates

  useEffect(() => {
    if (cities.length > 0) {
      setMapReady(true);
    }
  }, [cities]);

  return (
    <div className="map-container h-full">
      {mapReady && (
        <MapContainer 
          center={defaultPosition} 
          zoom={5} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {cities.map((city, index) => (
            <Marker
              key={index}
              position={[city.lat, city.lng]}
              icon={new Icon({ iconUrl: '/marker-icon.png', iconSize: [25, 41] })}
            >
              <Popup>{city.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default Map;