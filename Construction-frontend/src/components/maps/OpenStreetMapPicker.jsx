import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPinIcon, XMarkIcon, MapIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon with construction theme
const customMarkerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOS43OSAyIDggMy43OSA4IDZDOCAxMC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxNiAxMC4yNSAxNiA2QzE2IDMuNzkgMTQuMjEgMiAxMiAyWk0xMiA4QzEwLjkgOCAxMCA3LjEgMTAgNkMxMCA0LjkgMTAuOSA0IDEyIDRDMTMuMSA0IDE0IDQuOSAxNCA2QzE0IDcuMSAxMy4xIDggMTIgOFoiIGZpbGw9IiNFRjQ0NDQiLz4KPC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [13, 41]
});

// Component to handle map click events
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng });
    },
  });
  return null;
};

// Nominatim geocoding service for reverse geocoding
const getNominatimAddress = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'JaiBhavaniCementAgency/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Nominatim API request failed');
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    } else {
      throw new Error('No address found');
    }
  } catch (error) {
    console.warn('Nominatim geocoding failed:', error);
    // Return coordinates as fallback
    return `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
  }
};

// Nominatim search for address to coordinates
const searchNominatimAddress = async (query) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'JaiBhavaniCementAgency/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Nominatim search request failed');
    }
    
    const data = await response.json();
    return data.map(result => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
      importance: result.importance || 0
    }));
  } catch (error) {
    console.warn('Nominatim search failed:', error);
    return [];
  }
};

// Fallback Map Component (when map fails to load)
const FallbackMapPicker = ({ onLocationSelect, selectedLocation }) => {
  const [manualAddress, setManualAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ 
    lat: selectedLocation?.lat?.toString() || '', 
    lng: selectedLocation?.lng?.toString() || '' 
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleManualSubmit = () => {
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);
    
    if (!isNaN(lat) && !isNaN(lng) && manualAddress.trim()) {
      onLocationSelect({
        lat,
        lng,
        address: manualAddress.trim()
      });
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude.toString(), lng: longitude.toString() });
        
        // Try to get address using Nominatim
        const address = await getNominatimAddress(latitude, longitude);
        setManualAddress(address);
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please enter manually.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleAddressSearch = async () => {
    if (!manualAddress.trim()) return;
    
    setIsSearching(true);
    const results = await searchNominatimAddress(manualAddress.trim());
    setSearchResults(results);
    setIsSearching(false);
  };

  const selectSearchResult = (result) => {
    setCoordinates({
      lat: result.lat.toString(),
      lng: result.lng.toString()
    });
    setManualAddress(result.address);
    setSearchResults([]);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center text-blue-700 mb-2">
          <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span className="font-medium text-sm sm:text-base">OpenStreetMap Location Picker</span>
        </div>
        <p className="text-xs sm:text-sm text-blue-600">Using free OpenStreetMap with Nominatim geocoding service.</p>
      </div>

      <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center text-green-700 mb-2">
          <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span className="font-medium text-sm sm:text-base">Quick Location</span>
        </div>
        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
        >
          {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search Address</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="Search for address (e.g., Mumbai, Maharashtra)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
          />
          <button
            onClick={handleAddressSearch}
            disabled={isSearching || !manualAddress.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => selectSearchResult(result)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900 truncate">{result.address}</div>
                <div className="text-xs text-gray-500">
                  {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
          <input
            type="number"
            step="any"
            value={coordinates.lat}
            onChange={(e) => setCoordinates(prev => ({...prev, lat: e.target.value}))}
            placeholder="e.g., 19.0760"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
          <input
            type="number"
            step="any"
            value={coordinates.lng}
            onChange={(e) => setCoordinates(prev => ({...prev, lng: e.target.value}))}
            placeholder="e.g., 72.8777"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>
      
      <button
        onClick={handleManualSubmit}
        disabled={!manualAddress.trim() || !coordinates.lat || !coordinates.lng}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
      >
        Confirm Location
      </button>
    </div>
  );
};

const OpenStreetMapPicker = ({ onLocationSelect, onClose }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [defaultCenter] = useState({ lat: 19.0760, lng: 72.8777 }); // Mumbai, India
  const [useMap, setUseMap] = useState(true);
  const mapRef = useRef(null);

  // Get address from coordinates using Nominatim reverse geocoding
  const getAddressFromCoordinates = async (lat, lng) => {
    setIsLoadingAddress(true);
    const addressText = await getNominatimAddress(lat, lng);
    setAddress(addressText);
    setIsLoadingAddress(false);
    return addressText;
  };

  // Handle map click
  const handleMapClick = async (location) => {
    setSelectedLocation(location);
    await getAddressFromCoordinates(location.lat, location.lng);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        await handleMapClick(location);
        
        // Center map on location if available
        if (mapRef.current) {
          mapRef.current.setView([location.lat, location.lng], 16);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please select on the map.');
      }
    );
  };

  // Confirm selected location
  const handleConfirm = () => {
    if (selectedLocation && address) {
      onLocationSelect({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: address
      });
    }
  };

  // Handle map loading error
  const handleMapError = (error) => {
    console.warn('Map failed to load:', error);
    setUseMap(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Select Location on Map</h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        
        {useMap ? (
          <div className="space-y-3 sm:space-y-4">
            {/* OpenStreetMap */}
            <div className="w-full h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
                center={[defaultCenter.lat, defaultCenter.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
                scrollWheelZoom={true}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  onError={handleMapError}
                />
                <MapClickHandler onMapClick={handleMapClick} />
                {selectedLocation && (
                  <Marker 
                    position={[selectedLocation.lat, selectedLocation.lng]}
                    icon={customMarkerIcon}
                  />
                )}
              </MapContainer>
            </div>

            {/* Current Location Button */}
            <div className="flex justify-center">
              <button
                onClick={getCurrentLocation}
                className="px-4 sm:px-6 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Use Current Location</span>
              </button>
            </div>

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center text-green-700 mb-2">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="font-medium text-sm sm:text-base">Selected Location</span>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-xs sm:text-sm text-gray-600">
                    <strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </div>
                  {isLoadingAddress ? (
                    <div className="text-xs sm:text-sm text-gray-500">Loading address...</div>
                  ) : address && (
                    <div className="text-xs sm:text-sm text-gray-700">
                      <strong>Address:</strong> {address}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="text-blue-700 text-xs sm:text-sm">
                <strong>Instructions:</strong> Click anywhere on the map to select a location, or use the "Current Location" button to automatically detect your position. Free OpenStreetMap with unlimited usage.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
              <button
                onClick={onClose}
                className="w-full sm:flex-1 px-4 py-2.5 sm:py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedLocation || !address}
                className="w-full sm:flex-1 px-4 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
              >
                Confirm Location
              </button>
            </div>
          </div>
        ) : (
          <FallbackMapPicker 
            onLocationSelect={onLocationSelect}
            selectedLocation={selectedLocation}
          />
        )}
      </div>
    </div>
  );
};

export default OpenStreetMapPicker;
