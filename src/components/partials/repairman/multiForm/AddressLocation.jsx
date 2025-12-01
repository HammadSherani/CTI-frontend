"use client";
import React, { useState, useEffect } from 'react';
import { Controller } from "react-hook-form";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";

const AddressLocation = ({ control, errors, setValue, watch }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Watch for changes
  const selectedCountry = watch('country');
  const selectedState = watch('state');
  const selectedCity = watch('city');

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
      // Reset state and city when country changes
      setValue('state', '');
      setValue('city', '');
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [selectedCountry, setValue]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
      // Reset city when state changes
      setValue('city', '');
    } else {
      setCities([]);
    }
  }, [selectedState, setValue]);

  // Fetch Countries
  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await axiosInstance.get('/public/countries');
      
      if (response.data && response.data.data) {
        setCountries(response.data.data);
      } else {
        setCountries([]);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Failed to load countries. Please refresh the page.');
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch States by Country ID
  const fetchStates = async (countryId) => {
    try {
      setLoadingStates(true);
      const response = await axiosInstance.get(`/public/states/country/${countryId}`);
      
      if (response.data && response.data.data) {
        setStates(response.data.data);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      toast.error('Failed to load states.');
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch Cities by State ID
  const fetchCities = async (stateId) => {
    try {
      setLoadingCities(true);
      const response = await axiosInstance.get(`/public/cities/state/${stateId}`);
      
      if (response.data && response.data.data) {
        setCities(response.data.data);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Failed to load cities.');
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Address & Location</h2>

      {/* Shop Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Name <span className="text-red-500">*</span>
          </label>
          <Controller
            name="shopName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Enter your shop name"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.shopName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.shopName && (
            <p className="text-red-500 text-sm mt-1">{errors.shopName.message}</p>
          )}
        </div>
      </div>

      {/* Country, State, City Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Country Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                disabled={loadingCountries}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                } ${loadingCountries ? 'bg-gray-100 cursor-wait' : ''}`}
              >
                <option value="">
                  {loadingCountries ? 'Loading countries...' : 'Select Country'}
                </option>
                {countries.map((country) => (
                  <option key={country._id || country.id} value={country._id || country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
          )}
        </div>

        {/* State Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                disabled={!selectedCountry || loadingStates}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                } ${!selectedCountry || loadingStates ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {!selectedCountry
                    ? 'First select a country'
                    : loadingStates
                    ? 'Loading states...'
                    : 'Select State'}
                </option>
                {states.map((state) => (
                  <option key={state._id || state.id} value={state._id || state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
          )}
        </div>

        {/* City Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                disabled={!selectedState || loadingCities}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                } ${!selectedState || loadingCities ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {!selectedState
                    ? 'First select a state'
                    : loadingCities
                    ? 'Loading cities...'
                    : 'Select City'}
                </option>
                {cities.map((city) => (
                  <option key={city._id || city.id} value={city._id || city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* ZIP Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <Controller
            name="zipCode"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Enter ZIP code"
                maxLength={5}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.zipCode && (
            <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
          )}
        </div>

        {/* Tax Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Number <span className="text-red-500">*</span>
          </label>
          <Controller
            name="taxNumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Enter tax number"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.taxNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.taxNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.taxNumber.message}</p>
          )}
        </div>

        {/* Full Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Address <span className="text-red-500">*</span>
          </label>
          <Controller
            name="fullAddress"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows="3"
                placeholder="Enter complete address (street, building number, landmarks, etc.)"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.fullAddress ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.fullAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.fullAddress.message}</p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Address Selection</p>
            <p>
              Please select your country, state, and city from the dropdowns above. Then provide
              your complete shop address including street name, building number, and any landmarks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressLocation;