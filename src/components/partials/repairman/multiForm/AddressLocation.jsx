"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Controller } from "react-hook-form";

const AddressLocation = ({ control, errors, setValue, watch }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  // Watch for location changes
  const currentLocation = watch('location');
  const currentAddress = watch('address');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const initialMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 24.8607, lng: 67.0011 }, 
        zoom: 12,
        styles: [
          {
            featureType: "all",
            elementType: "geometry.fill",
            stylers: [{ weight: "2.00" }]
          },
          {
            featureType: "all",
            elementType: "geometry.stroke",
            stylers: [{ color: "#9c9c9c" }]
          }
        ]
      });

      setMap(initialMap);

      // Initialize SearchBox
      if (searchInputRef.current) {
        const searchBoxInstance = new window.google.maps.places.SearchBox(searchInputRef.current);
        setSearchBox(searchBoxInstance);

        // Bias SearchBox results towards current map's viewport
        initialMap.addListener("bounds_changed", () => {
          searchBoxInstance.setBounds(initialMap.getBounds());
        });

        searchBoxInstance.addListener("places_changed", () => {
          const places = searchBoxInstance.getPlaces();

          if (places.length === 0) {
            return;
          }

          // Clear existing marker
          if (marker) {
            marker.setMap(null);
          }

          const place = places[0];
          
          // Create new marker
          const newMarker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: initialMap,
            title: place.name,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(32, 32),
            }
          });

          setMarker(newMarker);

          // Update form values
          updateFormFromPlace(place);

          // Pan to the selected place
          initialMap.panTo(place.geometry.location);
          initialMap.setZoom(15);
        });
      }

      // Add click listener to map
      initialMap.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Clear existing marker
        if (marker) {
          marker.setMap(null);
        }

        // Create new marker
        const newMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: initialMap,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
          }
        });

        setMarker(newMarker);

        // Reverse geocoding to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            updateFormFromGeocode(results[0], lat, lng);
          }
        });
      });
    }
  }, [isLoaded, map, marker]);

  const updateFormFromPlace = (place) => {
    const addressComponents = place.address_components || [];
    let city = '';
    let district = '';
    let zipCode = '';
    
    addressComponents.forEach(component => {
      const types = component.types;
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        district = component.long_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setValue('city', city);
    setValue('district', district);
    setValue('zipCode', zipCode);
    setValue('fullAddress', place.formatted_address || '');
    setValue('location', {
      lat: lat,
      lng: lng,
      address: place.formatted_address || ''
    });

    // Set address with coordinates in the desired format
    setValue('address', {
      city: city,
      district: district,
      zipCode: zipCode,
      fullAddress: place.formatted_address || '',
      coordinates: [lat, lng]
    });
  };

  const updateFormFromGeocode = (result, lat, lng) => {
    const addressComponents = result.address_components || [];
    let city = '';
    let district = '';
    let zipCode = '';
    
    addressComponents.forEach(component => {
      const types = component.types;
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        district = component.long_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    setValue('city', city);
    setValue('district', district);
    setValue('zipCode', zipCode);
    setValue('fullAddress', result.formatted_address);
    setValue('location', {
      lat: lat,
      lng: lng,
      address: result.formatted_address
    });

    // Set address with coordinates in the desired format
    setValue('address', {
      city: city,
      district: district,
      zipCode: zipCode,
      fullAddress: result.formatted_address,
      coordinates: [lat, lng]
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Address & Location</h2>

      {/* Shop Name - This remains active */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
          <Controller
            name="shopName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Your shop name"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.shopName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.shopName && <p className="text-red-500 text-sm mt-1">{errors.shopName.message}</p>}
        </div>
      </div>

      {/* Location Search */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Your Location
        </label>
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Type your address or location name..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          <div className="absolute right-3 top-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          🔍 Search for your location above or click on the map below to select your exact position
        </p>
      </div>

      {/* Google Map */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Location on Map
        </label>
        <div 
          ref={mapRef}
          className="w-full h-96 border border-gray-300 rounded-lg"
          style={{ minHeight: '400px' }}
        >
          {!isLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Google Maps...</p>
              </div>
            </div>
          )}
        </div>
        {currentLocation && (
          <p className="text-sm mt-2">
            <span className='font-bold'>Location selected</span>: {currentLocation.address}
          </p>
        )}
        {currentAddress && currentAddress.coordinates && (
          <p className="text-sm text-primary-600 mt-1">
            <span className='font-bold'>Coordinates</span>: [{currentAddress.coordinates[0].toFixed(6)}, {currentAddress.coordinates[1].toFixed(6)}]
          </p>
        )}
      </div>

      {/* Disabled Location Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Auto-filled from map selection"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
          <Controller
            name="district"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Auto-filled from map selection"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
          <Controller
            name="zipCode"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                // disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Auto-filled from map selection"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Coordinates</label>
          <input
            type="text"
            disabled
            value={currentAddress?.coordinates ? `[${currentAddress.coordinates[0].toFixed(6)}, ${currentAddress.coordinates[1].toFixed(6)}]` : ''}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
            placeholder="[Lat, Lng] coordinates"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
          <Controller
            name="fullAddress"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows="3"
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Complete address will be auto-filled from map selection"
              />
            )}
          />
        </div>
      </div>

      
    </div>
  );
};

export default AddressLocation;