import { Icon } from "@iconify/react";
import { useState, useCallback, useRef, useEffect } from "react";

const servicePreferences = [
  { value: 'pickup', label: 'Pickup & Delivery', icon: 'mdi:truck-delivery' },
  { value: 'drop-off', label: 'On-site Repair', icon: 'mdi:home-repair' },
];

export const LocationPreferences = ({
  Controller,
  control,
  errors,
  getCurrentLocation,
  isGettingLocation,
  locationError,
  coordinates,
  setValue,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasLocationData, setHasLocationData] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  // Load Google Maps API and initialize services
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || process.env.REACT_APP_GOOGLE_API_KEY;
    
    if (!apiKey) {
      setSearchError('Google API key is missing. Location search is disabled.');
      return;
    }

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setSearchError('Failed to load Google Maps API. Please try again later.');
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize Google Places services when API is loaded
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      const map = new window.google.maps.Map(document.createElement('div'));
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, [isLoaded]);

  // Check if location data exists
  useEffect(() => {
    setHasLocationData(!!coordinates);
  }, [coordinates]);

  // Search places using Google Places API
  const searchPlaces = useCallback(async (query) => {
    if (!query.trim() || !autocompleteService.current) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      const request = {
        input: query,
        componentRestrictions: { country: 'pk' },
        types: ['establishment', 'geocode'],
      };

      autocompleteService.current.getPlacePredictions(request, (results, status) => {
        setIsSearching(false);

        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setSearchResults(results.slice(0, 5));
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setSearchResults([]);
          setSearchError('No results found');
        } else {
          setSearchError('Search failed. Please try again.');
          setSearchResults([]);
        }
      });
    } catch (error) {
      setIsSearching(false);
      setSearchError('Error searching places');
      console.error('Places search error:', error);
    }
  }, []);

  // Handle search input with debounce
  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    window.searchTimeout = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  // Get place details and set location
  const selectPlace = (placeId, description) => {
    if (!placesService.current) return;

    const request = {
      placeId: placeId,
      fields: ['geometry', 'address_components', 'formatted_address'],
    };

    placesService.current.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const location = place.geometry.location;
        const addressComponents = place.address_components || [];

        let city = '';
        let district = '';
        let zipCode = '';

        addressComponents.forEach(component => {
          const types = component.types;
          if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_3') || types.includes('sublocality')) {
            district = component.long_name;
          } else if (types.includes('postal_code')) {
            zipCode = component.long_name;
          }
        });

        setValue('location.address', place.formatted_address || description);
        setValue('location.city', city);
        setValue('location.district', district);
        setValue('location.zipCode', zipCode);
        setValue('location.coordinates', [location.lng(), location.lat()]);

        setHasLocationData(true);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        setSearchError('Failed to get place details');
      }
    });
  };

  // Clear location data
  const clearLocation = () => {
    setValue('location.address', '');
    setValue('location.city', '');
    setValue('location.district', '');
    setValue('location.zipCode', '');
    setValue('location.coordinates', null);
    setHasLocationData(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle current location success
  const handleLocationSuccess = () => {
    setHasLocationData(true);
  };

  // Enhanced getCurrentLocation
  const handleGetCurrentLocation = () => {
    getCurrentLocation(handleLocationSuccess);
  };

  return (
    <div className="space-y-4">
      

      {/* Search Location Section */}
      <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
        <div className="mb-3">
          <h4 className="text-base font-semibold text-primary-900 flex items-center gap-2 mb-2">
            <Icon icon="mdi:map-search" className="text-primary-600" />
            Search Location
          </h4>
          <p className="text-sm text-primary-700 mb-3">Search and select your address.</p>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search for your address, area, or landmark..."
              className="w-full p-3 pr-10 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={!isLoaded}
            />
            <Icon
              icon="mdi:magnify"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500"
            />
            {isSearching && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {searchError && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-md mb-3">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <Icon icon="mdi:alert-circle" />
              {searchError}
            </p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="bg-white border border-primary-200 rounded-md max-h-60 overflow-y-auto shadow-sm">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => selectPlace(result.place_id, result.description)}
                className="w-full p-3 text-left hover:bg-primary-50 border-b border-primary-100 last:border-b-0 transition-colors focus:bg-primary-50 focus:outline-none"
              >
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:map-marker" className="text-primary-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {result.structured_formatting?.main_text || result.description}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {result.structured_formatting?.secondary_text || result.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

     
      {/* Disabled Location Form Fields */}
      <div className="space-y-3 opacity-75">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Address Details (Auto-filled)</h4>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="location.address"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  {...field}
                  type="text"
                  placeholder="Address will be auto-filled"
                  disabled={true}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                {errors.location?.address && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <Icon icon="mdi:alert-circle" />
                    {errors.location.address.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="location.city"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  {...field}
                  type="text"
                  placeholder="City will be auto-filled"
                  disabled={true}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                {errors.location?.city && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <Icon icon="mdi:alert-circle" />
                    {errors.location.city.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="location.district"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District (Optional)</label>
                <input
                  {...field}
                  type="text"
                  placeholder="District will be auto-filled"
                  disabled={true}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            )}
          />

          <Controller
            name="location.zipCode"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code (Optional)</label>
                <input
                  {...field}
                  type="text"
                  placeholder="ZIP will be auto-filled"
                  disabled={true}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Preferred Date */}
      <Controller
        name="preferredDate"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
            <input
              {...field}
              type="date"
              min={(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString().split('T')[0];
              })()}
              className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.preferredDate ? 'border-red-300' : 'border-gray-300'
              }`}
              onChange={(e) => {
                const value = e.target.value;
                const formatted = new Date(value).toISOString().split("T")[0];
                field.onChange(formatted);
              }}
            />
            {errors.preferredDate && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <Icon icon="mdi:alert-circle" />
                {errors.preferredDate.message}
              </p>
            )}
          </div>
        )}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Service Preference *</label>
        <div className="grid grid-cols-2 gap-3">
          {servicePreferences.map((pref) => (
            <Controller
              key={pref.value}
              name="servicePreference"
              control={control}
              render={({ field }) => (
                <div
                  onClick={() => field.onChange(pref.value)}
                  className={`p-3 border rounded-md cursor-pointer text-center transition-colors ${
                    field.value === pref.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-orange-300 text-gray-700'
                  }`}
                >
                  <Icon
                    icon={pref.icon}
                    className={`text-xl mx-auto mb-2 ${
                      field.value === pref.value ? 'text-orange-500' : 'text-gray-400'
                    }`}
                  />
                  <span className="text-sm font-medium">{pref.label}</span>
                </div>
              )}
            />
          ))}
        </div>
        {errors.servicePreference && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <Icon icon="mdi:alert-circle" />
            {errors.servicePreference.message}
          </p>
        )}
      </div>
    </div>
  );
};