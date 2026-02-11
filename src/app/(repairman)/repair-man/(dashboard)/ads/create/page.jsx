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
import ServiceSelectionModal from '@/components/partials/repairman/ServiceSelectionModal';
import handleError from '@/helper/handleError';

// Helper for date restriction
const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3); // Except Today + Count 2 days = Minimum Start Date
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
};

// Validation schema
const createAdSchema = yup.object().shape({
  type: yup.string().required('Ad type is required'),
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
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .nullable()
    .required('Start date is required')
    .min(new Date(new Date().setHours(0, 0, 0, 0) + 2 * 24 * 60 * 60 * 1000), 'Start date must be at least 2 days from today'),
  currency: yup.string().required('Currency is required'),
});

function CreateAdvertisement() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  // State Management
  const [imagePreview, setImagePreview] = useState(null);
  const [calculatedEndDate, setCalculatedEndDate] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingBase, setLoadingBase] = useState(false);
  const [adminBasePrices, setBasePrices] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

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
      startDate: getMinDate(),
      city: '',
      currency: localStorage.getItem('user-currency'),
    },
  });

  const watchType = watch('type');
  const watchTotalDays = watch('totalDays');
  const watchStartDate = watch('startDate');
  const watchCurrency = watch('currency');

  // --- API CALLS ---

  const fetchProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      const { data } = await axiosInstance.get(`/repairman/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfileData(data?.data?.user);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const { data } = await axiosInstance.get(`/repairman/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(data?.data || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const response = await axiosInstance.get('/public/cities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchBasePrice = async () => {
    try {
      setLoadingBase(true);
      const response = await axiosInstance.get('/repairman/advertisements/fetch/base', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = response.data.data || [];
      setBasePrices(list);
      // Auto-set default currency from base prices
      // if (list.length > 0 && !watchCurrency) {
      //   setValue('currency', list[0]._id);
      // }
    } catch (error) {
      toast.error('Failed to load base prices');
    } finally {
      setLoadingBase(false);
    }
  };

  const selectedCurrency = localStorage.getItem('user-currency');

  const currency = JSON.parse(selectedCurrency);

  // --- DYNAMIC CALCULATIONS ---

  // Calculate Price from Backend & End Date Local
  useEffect(() => {
    const updateCalculations = async () => {
      // 1. Calculate End Date
      if (watchStartDate && watchTotalDays > 0) {
        const start = new Date(watchStartDate);
        const end = new Date(start);
        end.setDate(start.getDate() + parseInt(watchTotalDays));
        setCalculatedEndDate(end.toLocaleDateString('en-CA'));
      }

      // 2. Fetch Calculated Price from Backend
      // const selectedCurrencyObj = adminBasePrices.find(p => p._id === watchCurrency);



      if (watchTotalDays > 0) {
        try {
          setLoadingPrice(true);
          const { data } = await axiosInstance.get(
            `/repairman/advertisements/calculate-price?days=${watchTotalDays}&userCurrency=${currency?.code}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (data.success) {
            setCalculatedPrice(data.data.totalPrice);
          }
        } catch (error) {
          console.error("Price fetch error:", error);
          setCalculatedPrice(0);
        } finally {
          setLoadingPrice(false);
        }
      } else {
        setCalculatedPrice(0);
      }
    };

    const timeoutId = setTimeout(updateCalculations, 500);
    return () => clearTimeout(timeoutId);
  }, [watchTotalDays, watchStartDate, adminBasePrices, token, setValue]);

  // Initial Fetches
  useEffect(() => {
    fetchCities();
    fetchBasePrice();
    fetchServices();
  }, []);

  // Handle Ad Type Change
  useEffect(() => {
    if (watchType === 'profile') {
      setValue('title', '');
      setValue('description', '');
      setValue('city', '');
      setValue('image', null);
      setImagePreview(null);
      setSelectedServices([]);
      fetchProfileData();
    } else {
      setUserProfileData(null);
    }
  }, [watchType]);

  // --- HANDLERS ---

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectService = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s._id === service._id);
      return isSelected ? prev.filter(s => s._id !== service._id) : [...prev, service];
    });
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(prev => prev.filter(s => s._id !== serviceId));
  };

  const getCurrencySymbol = () => {
  // 1. Local storage se pura object uthayein
  const saved = localStorage.getItem("user-currency");
  
  if (saved) {
    const currencyObj = JSON.parse(saved);
      return currencyObj.symbol;
    }

};

  const onSubmit = async (data) => {
    try {
      let imageBase64 = null;
      if (data.image && data.image instanceof File) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(data.image);
        });
      }

      const selectedCurrencyObj = adminBasePrices.find(p => p._id === data.currency);

      const adData = {
        type: data.type,
        startDate: data.startDate,
        endDate: calculatedEndDate,
        totalDays: data.totalDays,
        currencyId: data.currency,
        currencyCode: selectedCurrencyObj?.currency,
        currencyBasePrice: selectedCurrencyObj?.basePrice || 0,
        totalPrice: calculatedPrice,
      };

      if (data.type === 'service') {
        adData.title = data.title;
        adData.description = data.description;
        adData.city = data.city;
        adData.image = imageBase64;
        adData.serviceList = selectedServices.map(s => s._id);
      } else {
        adData.profileId = userProfileData?._id;
      }

      sessionStorage.setItem('pendingAdData', JSON.stringify(adData));
      router.push('/repair-man/ads/payment');
    } catch (error) {
      console.error('Submission Error:', error);
      toast.error('Failed to process ad data');
    }
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
              type="button"
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
              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${watchType === 'service' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" value="service" {...register('type')} className="sr-only" />
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-3 rounded-lg ${watchType === 'service' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <Icon icon="mdi:briefcase" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Service</p>
                    <p className="text-sm text-gray-600">Promote a specific service</p>
                  </div>
                </div>
                {watchType === 'service' && <Icon icon="mdi:check-circle" className="w-6 h-6 text-primary-600 absolute top-4 right-4" />}
              </label>

              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${watchType === 'profile' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" value="profile" {...register('type')} className="sr-only" />
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-3 rounded-lg ${watchType === 'profile' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <Icon icon="mdi:account" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Profile</p>
                    <p className="text-sm text-gray-600">Promote your profile</p>
                  </div>
                </div>
                {watchType === 'profile' && <Icon icon="mdi:check-circle" className="w-6 h-6 text-primary-600 absolute top-4 right-4" />}
              </label>
            </div>
          </div>

          {/* Profile Display Section */}
          {watchType === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
              {isLoadingProfile ? (
                <div className="flex justify-center py-8"><Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-primary-600" /></div>
              ) : userProfileData ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={userProfileData.repairmanProfile?.profilePhoto || '/default-avatar.png'} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{userProfileData.name}</h3>
                      <p className="text-sm text-gray-600">{userProfileData.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t text-sm">
                    <div><p className="text-gray-500">Phone</p><p className="font-medium">{userProfileData.phone}</p></div>
                    <div><p className="text-gray-500">City</p><p className="font-medium">{userProfileData.city?.name || userProfileData.city || 'N/A'}</p></div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">Profile data not found.</p>
              )}
            </div>
          )}

          {/* Service Details Section */}
          {watchType === 'service' && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Title *</label>
                <input {...register('title')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.title ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., Professional Web Development" />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea {...register('description')} rows="5" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`} placeholder="Describe your service..." />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <select {...register('city')} className={`w-full px-4 py-2 border rounded-lg outline-none ${errors.city ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">Select City</option>
                    {cities.map(city => <option key={city._id} value={city._id}>{city.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Image *</label>
                  <div className="flex items-center gap-4">
                    {imagePreview && <img src={imagePreview} className="w-16 h-16 rounded-lg object-cover" alt="Preview" />}
                    <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-2 text-center cursor-pointer hover:border-primary-500">
                      <span className="text-xs text-gray-500">Click to upload</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}
                </div>
              </div>

              {/* Service Selection List */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Included Services</label>
                  <button type="button" onClick={() => setShowServiceModal(true)} className="text-primary-600 text-sm font-medium flex items-center gap-1">
                    <Icon icon="mdi:plus-circle" /> Add Services
                  </button>
                </div>
                {selectedServices.length > 0 ? (
                  <div className="space-y-2">
                    {selectedServices.map(service => (
                      <div key={service._id} className="flex justify-between items-center p-3 bg-gray-50 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{service.title}</p>
                          <p className="text-xs text-green-600 font-semibold">{service.pricing?.currency} {service.pricing?.total}</p>
                        </div>
                        <button type="button" onClick={() => handleRemoveService(service._id)} className="text-red-500"><Icon icon="mdi:close-circle" className="w-5 h-5" /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400 text-sm">No services selected</div>
                )}
              </div>
            </div>
          )}

          {/* Duration & Pricing Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Duration & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Days *</label>
                <input type="number" {...register('totalDays')} className="w-full px-4 py-2 border rounded-lg border-gray-300 outline-none" />
                {errors.totalDays && <p className="text-red-600 text-xs mt-1">{errors.totalDays.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
                <select {...register('currency')} className="w-full px-4 py-2 border rounded-lg border-gray-300 outline-none">
                  <option value="">Select Currency</option>
                  {adminBasePrices.map(p => <option key={p._id} value={p._id}>{p.currency}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input type="date" min={getMinDate()} {...register('startDate')} className="w-full px-4 py-2 border rounded-lg border-gray-300 outline-none" />
                {errors.startDate && <p className="text-red-600 text-xs mt-1">{errors.startDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Auto)</label>
                <input type="text" value={calculatedEndDate || 'Select date/days'} disabled className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-500" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Advertisement Cost</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {getCurrencySymbol()}
                    {calculatedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-gray-500">{adminBasePrices.find(p => p.defaultCurrency === currency.defaultCurrency)}</span>
                </div>
              </div>
              {loadingPrice ? <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-primary-400" /> : <Icon icon="mdi:calculator" className="w-10 h-10 text-primary-600 opacity-20" />}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 bg-white rounded-lg shadow-sm p-6">
            <button type="button" onClick={() => router.back()} disabled={isSubmitting} className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting || loadingPrice} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2">
              {isSubmitting && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
              Create Advertisement
            </button>
          </div>
        </form>

        {/* Modal */}
        <ServiceSelectionModal
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          services={services}
          selectedServices={selectedServices}
          onSelectService={handleSelectService}
          loading={loadingServices}
        />
      </div>
    </div>
  );
}

export default CreateAdvertisement;