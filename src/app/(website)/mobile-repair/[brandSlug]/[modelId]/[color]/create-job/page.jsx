"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useParams, useRouter } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import LoginModal from './LoginModal'; // Import your separate LoginModal component
import { ServiceSelector } from './ServiceSelector';
import { JobDetails } from './JobDetails';
import { DeviceInfo } from './DeviceInfo';
import { LocationPreferences } from './LocationPreferences';
import { BudgetRange } from './BudgetRange';
import Loader from '@/components/Loader';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';

// Yup schema (unchanged)
const schema = yup.object().shape({
  description: yup.string().required('Description is required').min(10, 'Please provide more details (minimum 20 characters)'),
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
    coordinates: yup.array().of(yup.number().optional()).length(2, 'Coordinates must contain exactly two values').nullable().optional(),
  }),
  preferredDate: yup.date().min(new Date(), 'Preferred time must be in the future').required('Preferred time is required'),
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
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null); // Store form data when login is required

  const { user, token } = useSelector((state) => state.auth);
  const router = useRouter();
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
    if (modelId) {
      getModelData();
    }
  }, [modelId]);

  // Show login modal when user first arrives on page and is not logged in
  useEffect(() => {
    if (!user || user.role !== "customer") {
      setShowLoginModal(true);
    }
  }, [user]);

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
        // Fix: Set coordinates as [longitude, latitude] - remove space and fix order
        setValue('location.coordinates', [longitude, latitude], { shouldValidate: true });
        try {
          // Fix: Pass latitude first, then longitude to reverseGeocode
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
    if (!user || user.role !== "customer") {
      setPendingFormData(formData);
      setShowLoginModal(true);
      return;
    }

    if (!isTermsAgreed) {
      alert('Please agree to the Terms and Conditions');
      return;
    }

    try {
      const submitData = {
        deviceInfo: {
          brandId: data?.model?.brandId?._id,
          modelId: modelData?._id || modelId,
          brand: data?.model?.brandId?.name,
          model: modelData?.name,
          color: color,
          warrantyStatus: formData.deviceInfo.warrantyStatus,
        },
        preferredDate: formData.preferredDate
          ? new Date(formData.preferredDate).toISOString().split("T")[0]
          : null,
        description: formData.description,
        urgency: formData.urgency,
        budget: formData.budget,
        location: formData.location,
        // preferredTime: formData.preferredTime,
        servicePreference: formData.servicePreference,
        services: formData.selectedServices || [],
        maxOffers: 10,
        autoSelectBest: false
      };

      console.log('Complete Form Data:', submitData);

      const response = await axiosInstance.post('/repair-jobs', submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        router.push('/my-account');
        setIsTermsAgreed(false);
      }

    } catch (error) {
      handleError(error);
    }
  };

  const handleLoginSuccess = (userData) => {
    console.log('Login successful:', userData);
    setShowLoginModal(false);
    if (pendingFormData) {
      onSubmit(pendingFormData);
      setPendingFormData(null);
    }
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setPendingFormData(null);
  };


  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <Loader>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex gap-3">
              <div className="w-40 h-auto bg-gray-800 rounded-md flex items-center justify-center">
                {modelData?.icon && (
                  <Image
                    src={modelData.icon}
                    alt={modelData?.name || 'Device'}
                    width={1000}
                    height={1000}
                    className="w-28 h-auto object-contain"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {modelData?.name}
                </h2>
                <p className="text-lg text-gray-600">
                  Brand: <span className="font-medium capitalize">{data?.model?.brandId?.name}</span>
                </p>
                <p className="text-lg text-gray-600">
                  Color: <span className="font-medium capitalize">{color}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pick Your Repair Service</h3>
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
                  <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
                </div>
                <JobDetails control={control} errors={errors} Controller={Controller} />
              </div>

              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="mdi:cellphone" className="text-lg text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Device Information</h3>
                </div>
                <DeviceInfo control={control} errors={errors} Controller={Controller} />
              </div>

              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="mdi:map-marker" className="text-lg text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Location & Preferences</h3>
                </div>
                <LocationPreferences
                  control={control}
                  errors={errors}
                  getCurrentLocation={getCurrentLocation}
                  isGettingLocation={isGettingLocation}
                  locationError={locationError}
                  coordinates={coordinates}
                  setValue={setValue} // Ye prop add karna zaroori hai
                  Controller={Controller}
                />
              </div>

              <div className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="mdi:currency-usd" className="text-lg text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Budget Range (Optional)</h3>
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
                  <label htmlFor="terms" className="text-lg text-gray-600">
                    I agree to the <a href="#" className="text-orange-500 hover:text-orange-600 underline">Terms and Conditions</a>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !isTermsAgreed}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span>Post Job</span>
                      <Icon icon="mdi:arrow-right" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {selectedServices.length === 0 && (
            <div className="p-4 bg-gray-50 rounded-b-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Summary</h3>
              <div className="bg-white rounded-md p-3 text-center">
                <p className="text-gray-500 text-lg">No Service Selected</p>
                <p className="text-gray-400 text-lg mt-1">Please select a repair service to see the estimated price range.</p>
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
                <label htmlFor="terms-default" className="text-lg text-gray-400">
                  I agree to the <a href="#" className="text-orange-500 hover:text-orange-600 underline">Terms and Conditions</a>
                </label>
              </div>
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md opacity-50 cursor-not-allowed text-lg"
              >
                <span>Post Jobs</span>
                <Icon icon="mdi:arrow-right" />
              </button>
            </div>
          )}
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={handleCloseLoginModal}
          onSuccess={handleLoginSuccess}
        />
      </div>
    </Loader>
  );
};

export default CreateRepairJobForm;