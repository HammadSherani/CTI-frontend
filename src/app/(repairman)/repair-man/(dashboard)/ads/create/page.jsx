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

// Validation schema
const createAdSchema = yup.object().shape({
  type: yup.string().required('Ad type is required'),
  // Service fields (conditional)
  title: yup.string().when('type', {
    is: 'service',
    then: (schema) => schema.required('Title is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  description: yup.string().when('type', {
    is: 'service',
    then: (schema) => schema.required('Description is required').min(20, 'Description must be at least 20 characters'),
    otherwise: (schema) => schema.notRequired(),
  }),
  city: yup.string().when('type', {
    is: 'service',
    then: (schema) => schema.required('City is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  image: yup.mixed().when('type', {
    is: 'service',
    then: (schema) => schema.required('Image is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  // Common fields
  totalDays: yup
    .number()
    .typeError('Days must be a number')
    .required('Total days is required')
    .positive('Days must be greater than zero')
    .integer('Days must be a whole number')
    .min(1, 'Minimum 1 day')
    .max(365, 'Maximum 365 days'),
  startDate: yup
    .date()
    .required('Start date is required')
    .min(new Date(), 'Start date cannot be in the past'),
  currency: yup.string().required('Currency is required'),
});

function CreateAdvertisement() {
  const router = useRouter();
  const { token, user } = useSelector((state) => state.auth);
  console.log(user,"user")
  const [imagePreview, setImagePreview] = useState(null);
  const [calculatedEndDate, setCalculatedEndDate] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingBase, setLoadingBase] = useState(false);
  const [adminBasePrices, setBasePrices] = useState([
    { currency: 'USD', price: 1 },
    { currency: 'PKR', price: 280 },
    { currency: 'EUR', price: 0.92 },
  ]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    control,
    reset,
  } = useForm({
    resolver: yupResolver(createAdSchema),
    defaultValues: {
      type: 'service',
      title: '',
      description: '',
      totalDays: 1,
      startDate: '',
      city: '',
      currency: 'USD',
    },
  });

  const watchType = watch('type');
  const watchTotalDays = watch('totalDays');
  const watchStartDate = watch('startDate');
  const watchCurrency = watch('currency');

  // Calculate end date based on start date and total days
  useEffect(() => {
    if (watchStartDate && watchTotalDays) {
      const start = new Date(watchStartDate);
      const end = new Date(start);
      end.setDate(start.getDate() + parseInt(watchTotalDays));
      setCalculatedEndDate(end.toISOString().split('T')[0]);
    } else {
      setCalculatedEndDate(null);
    }
  }, [watchStartDate, watchTotalDays]);

  // Calculate price based on days and currency
  useEffect(() => {
    if (watchTotalDays && watchCurrency) {
      const basePrice = adminBasePrices.find(p => p.currency === watchCurrency);
      if (basePrice) {
        const total = basePrice.price * parseInt(watchTotalDays);
        setCalculatedPrice(total);
      }
    }
  }, [watchTotalDays, watchCurrency]);


    // Fetch cities
    useEffect(() => {
      fetchCities();
      fetchBasePrice()
    }, []);
  
  
  
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await axiosInstance.get('/public/cities', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCities(response.data.data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast.error('Failed to load cities');
      } finally {
         setLoadingCities(false);
      }
    };


    
    const fetchBasePrice = async () => {
      try {
        setLoadingBase(true);
        const response = await axiosInstance.get('/advertise-base/fetch-base', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBasePrices(response.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoadingBase(false);
      }
    };


  // Fetch user profile when type is 'profile'
  useEffect(() => {
    if (watchType === 'profile') {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [watchType]);

  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      // Replace with actual API call
      const res = await axiosInstance.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res.data?.data || {
        // Static fallback
        _id: '12345',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+92 300 1234567',
        city: 'Karachi',
        profileImage: null,
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // Use static data on error
      setUserProfile({
        _id: '12345',
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@example.com',
        phone: '+92 300 1234567',
        city: 'Karachi',
        profileImage: null,
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      if (data.type === 'service') {
        formData.append('type', 'service');
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('city', data.city);
        if (data.image) {
          formData.append('image', data.image);
        }
      } else {
        formData.append('type', 'profile');
        formData.append('profileId', userProfile._id);
      }
      
      formData.append('startDate', data.startDate);
      formData.append('endDate', calculatedEndDate);
      formData.append('totalDays', data.totalDays);
      formData.append('currency', data.currency);
      formData.append('total', calculatedPrice);

      const res = await axiosInstance.post('/advertisement/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(res.data.message || 'Advertisement created successfully!');
      router.push('/user/advertisements');
    } catch (error) {
      console.error('Error creating advertisement:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create advertisement. Please try again.';
      toast.error(errorMessage);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      PKR: '₨',
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Go back"
            >
              <Icon icon="mdi:arrow-left" className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Advertisement</h1>
              <p className="text-gray-600 mt-1">Promote your service or profile</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Ad Type Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Advertisement Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  watchType === 'service'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value="service"
                  {...register('type')}
                  className="sr-only"
                />
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-3 rounded-lg ${
                    watchType === 'service' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon icon="mdi:briefcase" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Service</p>
                    <p className="text-sm text-gray-600">Promote a specific service</p>
                  </div>
                </div>
                {watchType === 'service' && (
                  <Icon icon="mdi:check-circle" className="w-6 h-6 text-primary-600 absolute top-4 right-4" />
                )}
              </label>

              <label
                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  watchType === 'profile'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value="profile"
                  {...register('type')}
                  className="sr-only"
                />
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-3 rounded-lg ${
                    watchType === 'profile' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon icon="mdi:account" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Profile</p>
                    <p className="text-sm text-gray-600">Promote your profile</p>
                  </div>
                </div>
                {watchType === 'profile' && (
                  <Icon icon="mdi:check-circle" className="w-6 h-6 text-primary-600 absolute top-4 right-4" />
                )}
              </label>
            </div>
            {errors.type && (
              <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Profile Display (when type is 'profile') */}
          {watchType === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
              {loadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : userProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {userProfile.profileImage ? (
                      <img
                        src={userProfile.profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                        <Icon icon="mdi:account" className="w-10 h-10 text-primary-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{userProfile.name}</h3>
                      <p className="text-sm text-gray-600">{userProfile.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Profile ID</p>
                      <p className="font-medium text-gray-900">{userProfile._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{userProfile.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium text-gray-900">{userProfile.city}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon icon="mdi:alert-circle" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Unable to load profile</p>
                </div>
              )}
            </div>
          )}

          {/* Service Details (when type is 'service') */}
          {watchType === 'service' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    {...register('title')}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Professional Web Development Services"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows="5"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe your service in detail..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    id="city"
                    {...register('city')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loadingCities}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city._id} value={city._id}>{city.name}</option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Image *
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                      />
                    )}
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Icon icon="mdi:cloud-upload" className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                        </div>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ad Duration & Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Duration & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="totalDays" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Days *
                </label>
                <input
                  id="totalDays"
                  type="number"
                  min="1"
                  max="365"
                  {...register('totalDays')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.totalDays ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Number of days"
                />
                {errors.totalDays && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalDays.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  id="currency"
                  {...register('currency')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.currency ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="PKR">PKR - Pakistani Rupee</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  id="startDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('startDate')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Auto-calculated)
                </label>
                <input
                  type="text"
                  value={calculatedEndDate || 'Select start date and days'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
            </div>

            {/* Price Summary */}
            {watchTotalDays > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {getCurrencySymbol(watchCurrency)}{calculatedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">{watchCurrency}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {getCurrencySymbol(watchCurrency)}
                      {adminBasePrices.find(p => p.currency === watchCurrency)?.price} per day × {watchTotalDays} days
                    </p>
                  </div>
                  <Icon icon="mdi:calculator" className="w-12 h-12 text-primary-600 opacity-50" />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 bg-white rounded-lg shadow-sm p-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
              Create Advertisement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAdvertisement;