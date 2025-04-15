// Helper functions for map functionality

/**
 * Extract location data from itinerary text
 * This is a simple implementation that looks for Indian cities in the itinerary
 * and assigns approximate coordinates for demonstration purposes
 * 
 * In a production environment, you would use a geocoding service to get accurate coordinates
 */
export const extractLocationsFromItinerary = (itineraryText) => {
  if (!itineraryText) return [];
  
  // Common Indian cities with approximate coordinates
  const cityCoordinates = {
    'delhi': { lat: 28.6139, lng: 77.2090 },
    'new delhi': { lat: 28.6139, lng: 77.2090 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'bengaluru': { lat: 12.9716, lng: 77.5946 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'agra': { lat: 27.1767, lng: 78.0081 },
    'varanasi': { lat: 25.3176, lng: 82.9739 },
    'kochi': { lat: 9.9312, lng: 76.2673 },
    'goa': { lat: 15.2993, lng: 74.1240 },
    'udaipur': { lat: 24.5854, lng: 73.7125 },
    'jaisalmer': { lat: 26.9157, lng: 70.9083 },
    'shimla': { lat: 31.1048, lng: 77.1734 },
    'manali': { lat: 32.2432, lng: 77.1892 },
    'darjeeling': { lat: 27.0410, lng: 88.2663 },
    'rishikesh': { lat: 30.0869, lng: 78.2676 },
    'amritsar': { lat: 31.6340, lng: 74.8723 },
    'jodhpur': { lat: 26.2389, lng: 73.0243 },
  };

  const locations = [];
  const itineraryLower = itineraryText.toLowerCase();

  // Find all occurrences of cities in the itinerary
  Object.keys(cityCoordinates).forEach(city => {
    if (itineraryLower.includes(city)) {
      locations.push({
        name: city.charAt(0).toUpperCase() + city.slice(1),
        lat: cityCoordinates[city].lat,
        lng: cityCoordinates[city].lng
      });
    }
  });

  // Remove duplicates (in case a city is mentioned multiple times)
  return [...new Map(locations.map(item => [item.name, item])).values()];
};

/**
 * Get the center coordinates for a set of locations
 */
export const getCenterCoordinates = (locations) => {
  if (!locations || locations.length === 0) {
    return [20.5937, 78.9629]; // Default center of India
  }
  
  if (locations.length === 1) {
    return [locations[0].lat, locations[0].lng];
  }
  
  // Calculate the center of all locations
  const totalLat = locations.reduce((sum, loc) => sum + loc.lat, 0);
  const totalLng = locations.reduce((sum, loc) => sum + loc.lng, 0);
  
  return [totalLat / locations.length, totalLng / locations.length];
};