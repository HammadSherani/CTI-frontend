"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useParams } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import Image from 'next/image';
import { ServiceSelector } from './ServiceSelector';
import { JobDetails } from './JobDetails';
import { DeviceInfo } from './DeviceInfo';
import { LocationPreferences } from './LocationPreferences';
import { BudgetRange } from './BudgetRange';
import { useSelector } from 'react-redux';

const schema = yup.object().shape({
  deviceInfo: yup.object().shape({
    warrantyStatus: yup.string().required('Warranty status is required'),
  }),
  urgency: yup.string().required('Urgency level is required'),
  budget: yup.object().shape({
    min: yup.number().min(0, 'Minimum budget cannot be negative').optional(),
    max: yup.number().min(0, 'Maximum budget cannot be negative').optional()
      .test('is-greater', 'Maximum budget must be greater than minimum', function (value) {
        return !this.parent.min || !value || value >= this.parent.min;
      }),
    currency: yup.string().required('Currency is required'),
  }),
  location: yup.object().shape({
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    district: yup.string().optional(),
    zipCode: yup.string().optional(),
    coordinates: yup.array().of(yup.number().required()).length(2, 'Coordinates must contain exactly two values').nullable().optional(),
  }),
  preferredTime: yup.date().min(new Date(), 'Preferred time must be in the future').required('Preferred time is required'),
  servicePreference: yup.string().required('Service preference is required'),
  selectedServices: yup.array().min(1, 'At least one service must be selected').required('Please select at least one service'),
  customServices: yup.array().of(
    yup.object().shape({
      id: yup.string().required(),
      name: yup.string().required(),
    })
  ).optional(),
});

const CreateRepairJobForm = () => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [modelData, setModelData] = useState(null);
  const [data, setData] = useState(null);
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFjNDY4MWNjNjQ4NmE2ZDQzMWQ1MmMiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NTY2NTc5OTQsImV4cCI6MTc1NzI2Mjc5NH0.TyJ5hyTDLs6y6iFYrktzCrnRmzXQ0v-PqXRy64bwUI0"

  const { brandSlug, modelId, color } = useParams();

  const getModelData = async () => {
    try {
      const response = await axiosInstance.get(`/public/models/${modelId}`);
      setModelData(response?.data?.data?.model);
      setData(response?.data?.data);
    } catch (error) {
      console.error('Error fetching model data:', error);
    }
  };

  useEffect(() => {
    getModelData();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      deviceInfo: { warrantyStatus: '' },
      selectedServices: [],
      customServices: [],
      urgency: 'medium',
      budget: { min: '', max: '', currency: 'PKR' },
      location: { address: '', city: '', district: '', zipCode: '', coordinates: null },
      preferredTime: '',
      servicePreference: 'pickup',
    }
  });

  const selectedServices = watch('selectedServices');
  const coordinates = watch('location.coordinates');

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          address: data.display_name || '',
          city: data.address?.city || data.address?.town || data.address?.village || '',
          district: data.address?.state_district || data.address?.county || '',
          zipCode: data.address?.postcode || ''
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    return null;
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setValue('location.coordinates', [latitude, longitude], { shouldValidate: true });
        try {
          const locationData = await reverseGeocode(latitude, longitude);
          if (locationData) {
            setValue('location.address', locationData.address);
            setValue('location.city', locationData.city);
            setValue('location.district', locationData.district);
            setValue('location.zipCode', locationData.zipCode);
          }
        } catch (error) {
          setLocationError('Location detected but unable to get address details.');
        }
        setIsGettingLocation(false);
      },
      () => {
        setLocationError('Location access denied or unavailable.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const onSubmit = async (formData) => {
    if (!isTermsAgreed) {
      alert('Please agree to the Terms and Conditions');
      return;
    }

    try {
      const submitData = {
        // Basic fields (optional as per model)
        // title: `${data?.model?.brandId?.name} ${modelData?.name} Repair`,
        // description: `Repair services for ${data?.model?.brandId?.name} ${modelData?.name}`,

        // Device info structure match backend model
        deviceInfo: {
          brandId: data?.model?.brandId?._id,
          modelId: modelData?._id || modelId,
          color: color,
          warrantyStatus: formData.deviceInfo.warrantyStatus,
        },

        // Keep existing fields as they match backend
        urgency: formData.urgency,
        budget: formData.budget,
        location: formData.location,
        preferredTime: formData.preferredTime,
        servicePreference: formData.servicePreference,

        // Convert selectedServices to services array (backend expects services field)
        services: formData.selectedServices || [],

        // Optional fields with defaults
        maxOffers: 10,
        autoSelectBest: false
      };

      console.log('Complete Form Data:', submitData);

      // Uncomment below when ready to submit
      const response = await axiosInstance.post('/repair-jobs', submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        alert('Repair job created successfully!');
        // reset();
        setIsTermsAgreed(false);
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to create repair job. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex gap-3">
            <div className="w-20 h-auto bg-gray-800 rounded-md flex items-center justify-center">
              <Image
                src={modelData?.icon}
                alt={modelData?.name}
                width={1000}
                height={1000}
                className="w-full h-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {modelData?.name}
              </h2>
              <p className="text-sm text-gray-600">
                Brand: <span className="font-medium capitalize">{data?.model?.brandId?.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Color: <span className="font-medium capitalize">{color}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Pick Your Repair Service</h3>
          <ServiceSelector
            control={control}
            errors={errors}
            selectedServices={selectedServices}
            setValue={setValue}
            watch={watch}
            Controller={Controller}
          />
        </div>
        {selectedServices.length > 0 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="mdi:clipboard-text" className="text-lg text-orange-500" />
                <h3 className="text-base font-semibold text-gray-900">Job Details</h3>
              </div>
              <JobDetails control={control} errors={errors} Controller={Controller} />
            </div>
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="mdi:cellphone" className="text-lg text-orange-500" />
                <h3 className="text-base font-semibold text-gray-900">Device Information</h3>
              </div>
              <DeviceInfo control={control} errors={errors} Controller={Controller} />
            </div>
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="mdi:map-marker" className="text-lg text-orange-500" />
                <h3 className="text-base font-semibold text-gray-900">Location & Preferences</h3>
              </div>
              <LocationPreferences
                control={control}
                errors={errors}
                getCurrentLocation={getCurrentLocation}
                isGettingLocation={isGettingLocation}
                locationError={locationError}
                coordinates={coordinates}
                Controller={Controller}
              />
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="mdi:currency-usd" className="text-lg text-orange-500" />
                <h3 className="text-base font-semibold text-gray-900">Budget Range (Optional)</h3>
              </div>
              <BudgetRange control={control} errors={errors} Controller={Controller} />
            </div>
            <div className="bg-gray-50 p-4 rounded-b-lg">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={isTermsAgreed}
                  onChange={(e) => setIsTermsAgreed(e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  I agree to the <a href="#" className="text-orange-500 hover:text-orange-600 underline">Terms and Conditions</a>
                </label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !isTermsAgreed}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>Book Now</span>
                    <Icon icon="mdi:arrow-right" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        {selectedServices.length === 0 && (
          <div className="p-4 bg-gray-50 rounded-b-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Price Summary</h3>
            <div className="bg-white rounded-md p-3 text-center">
              <p className="text-gray-500 text-base">No Service Selected</p>
              <p className="text-gray-400 text-xs mt-1">Please select a repair service to see the estimated price range.</p>
            </div>
            <div className="flex items-center gap-2 my-3">
              <input
                type="checkbox"
                id="terms-default"
                checked={isTermsAgreed}
                onChange={(e) => setIsTermsAgreed(e.target.checked)}
                disabled
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="terms-default" className="text-xs text-gray-400">
                I agree to the <a href="#" className="text-orange-500 hover:text-orange-600 underline">Terms and Conditions</a>
              </label>
            </div>
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md opacity-50 cursor-not-allowed text-base"
            >
              <span>Post Jobs</span>
              <Icon icon="mdi:arrow-right" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default CreateRepairJobForm;




