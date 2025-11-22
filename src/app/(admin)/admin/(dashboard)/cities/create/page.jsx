"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Autocomplete from 'react-google-autocomplete';

const citySchema = yup.object().shape({
  name: yup
    .string()
    .required('City name is required')
    .min(2, 'City name must be at least 2 characters')
    .max(100, 'City name must be less than 100 characters'),
  country: yup
    .string()
    .required('Country is required'),
  state: yup
    .string()
    .required('State is required'),
  latitude: yup
    .number()
    .required('Please select a valid location')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: yup
    .number()
    .required('Please select a valid location')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

// Country name to ISO code mapping
const countryISOCodes = {
  'Pakistan': 'PK',
  'India': 'IN',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Canada': 'CA',
  'Australia': 'AU',
  'China': 'CN',
  'Japan': 'JP',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Russia': 'RU',
  'South Africa': 'ZA',
  'Saudi Arabia': 'SA',
  'UAE': 'AE',
  'Turkey': 'TR',
  'Bangladesh': 'BD',
  'Egypt': 'EG',
  'Indonesia': 'ID',
  'Malaysia': 'MY',
  'Singapore': 'SG',
  'Thailand': 'TH',
  'Vietnam': 'VN',
  'Philippines': 'PH',
  'South Korea': 'KR',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Venezuela': 'VE',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Ghana': 'GH',
  'Morocco': 'MA',
  'Algeria': 'DZ',
  'Tunisia': 'TN',
  'New Zealand': 'NZ',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Greece': 'GR',
  'Portugal': 'PT',
  'Ireland': 'IE',
  'Israel': 'IL',
  'Iran': 'IR',
  'Iraq': 'IQ',
  'Jordan': 'JO',
  'Lebanon': 'LB',
  'Kuwait': 'KW',
  'Qatar': 'QA',
  'Bahrain': 'BH',
  'Oman': 'OM',
  'Yemen': 'YE',
  'Afghanistan': 'AF',
  'Sri Lanka': 'LK',
  'Nepal': 'NP',
  'Myanmar': 'MM',
  'Cambodia': 'KH',
  'Laos': 'LA',
};

function CreateCity() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [autocompleteKey, setAutocompleteKey] = useState(0);
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(citySchema),
    defaultValues: {
      name: '',
      country: '',
      state: '',
      latitude: '',
      longitude: '',
    },
  });

  const watchedName = watch('name');
  const watchedCountry = watch('country');
  const watchedState = watch('state');
  const watchedLatitude = watch('latitude');
  const watchedLongitude = watch('longitude');

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (watchedCountry) {
      fetchStates(watchedCountry);
      const selectedCountry = countries.find(c => c._id === watchedCountry);
      if (selectedCountry) {
        const countryCode = countryISOCodes[selectedCountry.name];
        setSelectedCountryCode(countryCode || '');
        // Reset state and city when country changes
        setValue('state', '');
        setValue('name', '');
        setValue('latitude', '');
        setValue('longitude', '');
        setAutocompleteKey(prev => prev + 1);
      }
    } else {
      setStates([]);
      setSelectedCountryCode('');
    }
  }, [watchedCountry, countries]);

  useEffect(() => {
    if (watchedState) {
      // Reset city name when state changes
      setValue('name', '');
      setValue('latitude', '');
      setValue('longitude', '');
      setAutocompleteKey(prev => prev + 1);
    }
  }, [watchedState]);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await axiosInstance.get('/admin/countries?limit=1000&isActive=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCountries(response.data.data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Failed to load countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      setLoadingStates(true);
      const response = await axiosInstance.get(`/admin/states/country/${countryId}?isActive=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
      toast.error('Failed to load states');
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const onValid = async (data) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');

      const payload = {
        name: data.name,
        state: data.state,
        isActive: true,
        coordinates: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
      };

      const response = await axiosInstance.post('/admin/cities', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(response.data.message || 'City created successfully!');
      setSubmitSuccess('City created successfully!');
      reset();
      setStates([]);
      setSelectedCountryCode('');

      setTimeout(() => setSubmitSuccess(''), 5000);

      setTimeout(() => {
        router.push('/admin/cities');
      }, 2000);
    } catch (error) {
      console.error('Error creating city:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create city. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const onInvalid = (errors) => {
    if (errors.latitude || errors.longitude) {
      toast.error('Please select valid location and coordinates');
    }
  };

  const handleCancel = () => {
    reset();
    setSubmitError('');
    setSubmitSuccess('');
    setStates([]);
    setSelectedCountryCode('');
    router.push('/admin/cities');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Back to cities"
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New City</h1>
                <p className="text-gray-600 mt-1">Add a new city with location details</p>
              </div>
            </div>
          </div>
        </div>

        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800">{submitSuccess}</p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onValid, onInvalid)} className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <div className="relative">
                <Icon
                  icon="mdi:earth"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10"
                />
                <select
                  id="country"
                  {...register('country')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  } ${watchedCountry ? 'bg-green-50' : ''}`}
                  disabled={loadingCountries}
                >
                  <option value="">Select a country first</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country._id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <Icon
                  icon="mdi:chevron-down"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"
                />
              </div>
              {loadingCountries && (
                <p className="mt-1 text-xs text-gray-500 flex items-center">
                  <Icon icon="mdi:loading" className="w-3 h-3 mr-1 animate-spin" />
                  Loading countries...
                </p>
              )}
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <div className="relative">
                <Icon
                  icon="mdi:map-marker"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10"
                />
                <select
                  id="state"
                  {...register('state')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  } ${watchedState ? 'bg-green-50' : ''}`}
                  disabled={!watchedCountry || loadingStates}
                >
                  <option value="">
                    {!watchedCountry ? 'Select a country first' : 'Select a state'}
                  </option>
                  {states.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <Icon
                  icon="mdi:chevron-down"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"
                />
              </div>
              {loadingStates && (
                <p className="mt-1 text-xs text-gray-500 flex items-center">
                  <Icon icon="mdi:loading" className="w-3 h-3 mr-1 animate-spin" />
                  Loading states...
                </p>
              )}
              {watchedCountry && states.length === 0 && !loadingStates && (
                <p className="mt-1 text-xs text-amber-600 flex items-center">
                  <Icon icon="mdi:alert" className="w-3 h-3 mr-1" />
                  No states found for selected country
                </p>
              )}
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                City Name *
              </label>
              {!watchedState ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                  <Icon icon="mdi:information" className="w-4 h-4 mr-2" />
                  Please select a country and state first
                </div>
              ) : (
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      key={autocompleteKey}
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                      onPlaceSelected={(place) => {
                        const cityName = place.name || place.formatted_address;
                        const lat = place.geometry?.location?.lat();
                        const lng = place.geometry?.location?.lng();
                        
                        setValue('name', cityName, { shouldValidate: true });
                        if (lat) setValue('latitude', lat, { shouldValidate: true });
                        if (lng) setValue('longitude', lng, { shouldValidate: true });
                      }}
                      options={{
                        types: ['(cities)'],
                        componentRestrictions: selectedCountryCode ? { country: selectedCountryCode } : undefined,
                      }}
                      defaultValue={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={`Start typing city name from ${states.find(s => s._id === watchedState)?.name || 'selected state'}...`}
                    />
                  )}
                />
              )}
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <Icon icon="mdi:information" className="w-3 h-3 mr-1" />
                {watchedState 
                  ? `Only cities from ${countries.find(c => c._id === watchedCountry)?.name} will be shown`
                  : 'Select a state to enable city selection'
                }
              </p>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create City'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCity;
