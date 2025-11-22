"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Autocomplete from 'react-google-autocomplete';

const countrySchema = yup.object().shape({
  name: yup
    .string()
    .required('Country name is required')
    .min(2, 'Country name must be at least 2 characters')
    .max(100, 'Country name must be less than 100 characters'),
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

function CreateCountry() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
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
    resolver: yupResolver(countrySchema),
    defaultValues: {
      name: '',
      latitude: '',
      longitude: '',
    },
  });

  const watchedName = watch('name');
  const watchedLatitude = watch('latitude');
  const watchedLongitude = watch('longitude');

  const onValid = async (data) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');

      const payload = {
        name: data.name,
        isActive: true,
        coordinates: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
      };

      const response = await axiosInstance.post('/admin/countries', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(response.data.message || 'Country created successfully!');
      setSubmitSuccess('Country created successfully!');
      reset();

      setTimeout(() => setSubmitSuccess(''), 5000);

      setTimeout(() => {
        router.push('/admin/countries');
      }, 2000);
    } catch (error) {
      console.error('Error creating country:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create country. Please try again.';
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
    router.push('/admin/countries');
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
                title="Back to countries"
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Country</h1>
                <p className="text-gray-600 mt-1">Add a new country with location details</p>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Country Name *
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                    onPlaceSelected={(place) => {
                      const countryName = place.name || place.formatted_address;
                      const lat = place.geometry?.location?.lat();
                      const lng = place.geometry?.location?.lng();
                      
                      setValue('name', countryName, { shouldValidate: true });
                      if (lat) setValue('latitude', lat, { shouldValidate: true });
                      if (lng) setValue('longitude', lng, { shouldValidate: true });
                      
                    }}
                    options={{
                      types: ['country'],
                    }}
                    defaultValue={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Start typing country name... (e.g., Pakistan)"
                  />
                )}
              />
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <Icon icon="mdi:information" className="w-3 h-3 mr-1" />
                Start typing to see country suggestions.
              </p>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Icon icon="mdi:map-marker" className="w-5 h-5 mr-2 text-primary-600" />
                Geographic Coordinates *
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <Icon icon="mdi:information" className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Coordinates will auto-fill when you select a country from suggestions. You can also manually enter or edit them.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <div className="relative">
                    <Icon
                      icon="mdi:latitude"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    />
                    <input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      {...register('latitude')}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.latitude ? 'border-red-500' : 'border-gray-300'
                      } ${watchedLatitude ? 'bg-green-50' : ''}`}
                      placeholder="e.g., 30.3753"
                    />
                    {watchedLatitude && !errors.latitude && (
                      <Icon
                        icon="mdi:check-circle"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Range: -90 to 90</p>
                  {errors.latitude && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.latitude.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <div className="relative">
                    <Icon
                      icon="mdi:longitude"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    />
                    <input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      {...register('longitude')}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.longitude ? 'border-red-500' : 'border-gray-300'
                      } ${watchedLongitude ? 'bg-green-50' : ''}`}
                      placeholder="e.g., 69.3451"
                    />
                    {watchedLongitude && !errors.longitude && (
                      <Icon
                        icon="mdi:check-circle"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Range: -180 to 180</p>
                  {errors.longitude && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.longitude.message}
                    </p>
                  )}
                </div>
              </div>

              {(watchedLatitude && watchedLongitude) && !errors.latitude && !errors.longitude && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Icon icon="mdi:information" className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Coordinate Preview</p>
                      <p className="text-sm text-blue-800">
                        Latitude: {watchedLatitude}° | Longitude: {watchedLongitude}°
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div> */}
{/* 
            {watchedName && watchedLatitude && watchedLongitude && !errors.name && !errors.latitude && !errors.longitude && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <Icon icon="mdi:earth" className="w-8 h-8 text-primary-600 mr-3 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{watchedName}</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 flex items-center">
                          <Icon icon="mdi:latitude" className="w-4 h-4 mr-1" />
                          Latitude: {watchedLatitude}°
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Icon icon="mdi:longitude" className="w-4 h-4 mr-1" />
                          Longitude: {watchedLongitude}°
                        </p>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Icon icon="mdi:eye" className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            <div className="flex justify-end gap-3 pt-3 ">
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
                {isSubmitting ? 'Creating...' : 'Create Country'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCountry;