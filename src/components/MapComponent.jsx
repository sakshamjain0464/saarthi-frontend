'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin } from 'lucide-react'

// Fix leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
})

const MapComponent = ({ locations }) => {
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629])
  const [zoom, setZoom] = useState(5)
  const [mobileMapVisible, setMobileMapVisible] = useState(false)
  const [desktopMap, setDesktopMap] = useState(null)
  const [mobileMap, setMobileMap] = useState(null)

  const validLocations = useMemo(() => {
    return locations.filter(
      loc =>
        loc.lat !== null &&
        loc.long !== null &&
        !isNaN(parseFloat(loc.lat)) &&
        !isNaN(parseFloat(loc.long))
    )
  }, [locations])

  useEffect(() => {
    if (validLocations.length > 0) {
      const firstLocation = validLocations[0]
      setMapCenter([
        parseFloat(firstLocation.lat),
        parseFloat(firstLocation.long)
      ])
      setZoom(validLocations.length === 1 ? 10 : 5)
    }
  }, [validLocations])

  const toggleMobileMap = () => setMobileMapVisible(!mobileMapVisible)
  const closeMobileMap = () => setMobileMapVisible(false)

  const zoomToMarker = (lat, long, mapInstance) => {
    const zoomLevel = 6
    if (mapInstance) {
      mapInstance.flyTo([lat, long], zoomLevel, {
        animate: true,
        duration: 1.5
      })
    }
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className='hidden md:flex h-full w-full mx-auto'>
        <div className='flex-1 pl-5'>
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: 'calc(100% - 40px)', width: '100%' }}
            whenCreated={setDesktopMap}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            {validLocations.map((location, index) => (
              <Marker
                key={index}
                position={[parseFloat(location.lat), parseFloat(location.long)]}
                eventHandlers={{
                  click: () =>
                    zoomToMarker(
                      parseFloat(location.lat),
                      parseFloat(location.long),
                      desktopMap
                    )
                }}
              >
                <Tooltip direction='top'>{location.name}</Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Mobile Map Toggle Button */}
      <div
        className='fixed md:hidden bottom-5 right-5 w-[60px] h-[60px] rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg z-[1000] cursor-pointer'
        onClick={toggleMobileMap}
      >
        <MapPin className='w-[30px] h-[30px]' />
      </div>

      {/* Mobile Map Popup */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 z-[2000] flex items-center justify-center transition-opacity duration-300 ${
          mobileMapVisible
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className='w-[90%] h-[80%] bg-white rounded-lg overflow-hidden relative'>
          <div className='flex justify-between items-center px-3 py-2 bg-blue-500 text-white z-[1000]'>
            <h3 className='text-base font-medium m-0'>Trip Map</h3>
            <button
              className='text-white text-xl px-2 focus:outline-none'
              onClick={closeMobileMap}
            >
              ×
            </button>
          </div>
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: 'calc(100% - 40px)', width: '100%' }}
            whenCreated={setMobileMap}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            {validLocations.map((location, index) => (
              <Marker
                key={index}
                position={[parseFloat(location.lat), parseFloat(location.long)]}
                eventHandlers={{
                  click: () =>
                    zoomToMarker(
                      parseFloat(location.lat),
                      parseFloat(location.long),
                      mobileMap
                    )
                }}
              >
                <Tooltip direction='top'>{location.name}</Tooltip>
                <Popup>{location.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </>
  )
}

export default MapComponent
