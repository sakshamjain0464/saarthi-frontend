import React from 'react';
import MapComponent from './MapComponent';
import './MapComponent.css';

/**
 * ChatMapLayout - A responsive layout component that wraps chat and map components
 * On desktop: Chat on left, Map on right
 * On mobile: Chat takes full width, Map is accessible via a bubble
 */
const ChatMapLayout = ({ children, locations = [], onCloseMap }) => {
  return (
    <div className="chat-map-container">
      {/* Chat container */}
      <div className="chat-container">
        {children}
      </div>
      
      {/* Map component handles its own responsive behavior */}
      <MapComponent 
        locations={locations} 
        isVisible={true} 
        onClose={onCloseMap} 
      />
    </div>
  );
};

export default ChatMapLayout;