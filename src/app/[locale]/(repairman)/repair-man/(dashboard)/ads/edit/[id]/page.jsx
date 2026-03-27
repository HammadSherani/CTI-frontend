"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import handleError from '@/helper/handleError';
import { set } from 'date-fns';
import ServiceSelectionModal from '@/components/partials/repairman/ServiceSelectionModal';

// Validation schema
const editAdSchema = yup.object().shape({
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


  currency: yup.string().required('Currency is required'),

});

function EditAdvertisement() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { token } = useSelector((state) => state.auth);
  const [imagePreview, setImagePreview] = useState(null);
  const [calculatedEndDate, setCalculatedEndDate] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [loadingAd, setLoadingAd] = useState(true);
  const [loadingBase, setLoadingBase] = useState(false);
  const [adminBasePrices, setBasePrices] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    control,
    reset,
  } = useForm({
    resolver: yupResolver(editAdSchema),
    defaultValues: {
      type: '',
      title: '',
      description: '',
      totalDays: 1,
      startDate: '',
      city: '',
      currency: '',
      selectedService: ''
    },
  });

  const watchType = watch('type');
  const watchTotalDays = watch('totalDays');
  const watchStartDate = watch('startDate');
  const watchCurrency = watch('currency');

  // Fetch ad details
  useEffect(() => {
    fetchAdDetails();
    fetchCities();
    fetchBasePrice();
    fetchServices()
  }, [id]);

  const fetchAdDetails = async () => {
    try {
      setLoadingAd(true);
      const { data } = await axiosInstance.get(`/repairman/advertisements/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
   setCurrentAd(data.data);
          
        
          
    } catch (error) {
      handleError(error);
      setLoadingAd(false);
      // router.push('/repair-man/ads');
    }finally {
      setLoadingAd(false);
    }
  };

 useEffect(() => {
  console.log('Current Ad Data:', currentAd);
  if (currentAd) {
    setValue('type', currentAd.type);
    setValue('totalDays', currentAd.duration?.totalDays || 0);
    setValue('currency', currentAd.budget?.currencyCode || 'PKR');
    
    // Format and set start date properly
    if (currentAd.duration?.startDate) {
      const startDate = new Date(currentAd.duration.startDate);
      const formattedStartDate = startDate.toISOString().split('T')[0];
      setValue('startDate', formattedStartDate);
    }
    
    // Set calculated end date
    if (currentAd.duration?.endDate) {
      const endDate = new Date(currentAd.duration.endDate);
      const formattedEndDate = endDate.toISOString().split('T')[0];
      setCalculatedEndDate(formattedEndDate);
    }
    
    // Set calculated price
    setCalculatedPrice(currentAd.budget?.totalPrice || 0);
    
    // Set service-specific fields
    if (currentAd.type === 'service') {
      setValue('title', currentAd.title || '');
      setValue('description', currentAd.description || '');
      setValue('city', currentAd.city?._id || '');
      setImagePreview(currentAd.image || null);
      // populate selected services so user can see/edit them
      setSelectedServices(Array.isArray(currentAd.serviceList) ? currentAd.serviceList : []);
    }
  }
}, [currentAd, setValue]);

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
      const fetchServices = async () => {
      try {
        setLoadingServices(true)
        const { data } = await axiosInstance.get(`/repairman/services`, {
          headers: {
            'Authorization': `Bearer ${token}`
            }
          })
          setServices(data?.data || [])
        } catch (error) {
          handleError(error)
        } finally {
          setLoadingServices(false)
        }
      }
  const fetchBasePrice = async () => {
    try {
      setLoadingBase(true);
      const response = await axiosInstance.get('/repairman/advertisements/fetch/base', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBasePrices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching base prices:', error);
      toast.error('Failed to load base prices');
    } finally {
      setLoadingBase(false);
    }
  };
console.log('Admin Base Prices:', adminBasePrices);
console.log('currentAd:', currentAd);
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

  useEffect(() => {
    const days = parseInt(watchTotalDays);
    if (days && !isNaN(days) && days > 0 && watchCurrency && adminBasePrices.length > 0) {
      const basePrice = adminBasePrices.find(p => p.currency === watchCurrency);
      if (basePrice && basePrice.basePrice) {
        const total = basePrice.basePrice * days;
        setCalculatedPrice(total);
      } else {
        setCalculatedPrice(0);
      }
    } else {
      setCalculatedPrice(0);
    }
  }, [watchTotalDays, watchCurrency, adminBasePrices]);



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

  const handleSelectService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s._id === service._id);
      if (exists) return prev.filter(s => s._id !== service._id);
      return [...prev, service];
    });
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(prev => prev.filter(s => s._id !== serviceId));
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
        // include selected services ids
        if(selectedServices.length === 0){
          toast.error('Please select at least one service to proceed');
          return;
        }
        try {
          formData.append('serviceList', JSON.stringify(selectedServices.map(s => s._id)));
        } catch (e) {}
      } else {
        formData.append('type', 'profile');
        formData.append('profileId', currentAd?.user.id?._id);
      }
      
      formData.append('startDate', data.startDate);
      formData.append('endDate', calculatedEndDate);
      formData.append('totalDays', data.totalDays);
      formData.append('currency', data.currency);
      formData.append('totalPrice', calculatedPrice);

      const res = await axiosInstance.put(`/repairman/advertisements/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Advertisement updated successfully!');
      router.push('/repair-man/ads');
    } catch (error) {
      console.error('Error updating advertisement:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to update advertisement. Please try again.';
      toast.error(errorMessage);
    }
  };
  // const handleSelectService = (service) => {
  //   setSelectedServices(prev => {
  //     const isSelected = prev.some(s => s._id === service._id);
  //     if (isSelected) {
  //       return prev.filter(s => s._id !== service._id);
  //     } else {
  //       return [...prev, service];
  //     }
  //   });
  // };

  //  const handleRemoveService = (serviceId) => {
  //   setSelectedServices(prev => prev.filter(s => s._id !== serviceId));
  // };
  

  if (loadingAd) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading advertisement...</p>
        </div>
      </div>
    );
  }

  if (!currentAd) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:alert-circle" className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Advertisement not found</p>
        </div>
      </div>
    );
  }

  // Don't allow editing approved ads
  if (currentAd.status === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon icon="mdi:lock" className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Cannot Edit Approved Ad</h3>
          <p className="text-gray-600 mb-4">This advertisement has been approved and cannot be edited.</p>
          <button
            onClick={() => router.push('/repair-man/ads')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Ads
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Advertisement</h1>
              <p className="text-gray-600 mt-1">Update your advertisement details</p>
            </div>
          </div>
        </div>

        {/* Status Info */}
        {currentAd.status === 'rejected' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold text-red-900">Advertisement Rejected</h3>
                <p className="text-sm text-red-700 mt-1">
                  {currentAd.rejectionReason || 'Your advertisement was rejected. Please make necessary changes and resubmit.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Ad Type (Disabled) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Advertisement Type</h2>
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  watchType === 'service' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                }`}>
                  <Icon icon={watchType === 'service' ? 'mdi:briefcase' : 'mdi:account'} className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {watchType === 'service' ? 'Service Advertisement' : 'Profile Advertisement'}
                  </p>
                  <p className="text-sm text-gray-600">Type cannot be changed after creation</p>
                </div>
              </div>
            </div>
          </div>

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
                    Service Image
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
                  <p className="mt-2 text-xs text-gray-500">Leave blank to keep current image</p>
                </div>


     <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Service List (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowServiceModal(true)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Icon icon="mdi:plus-circle" className="w-4 h-4" />
                      Add Services
                    </button>
                  </div>
                  
                  {selectedServices.length > 0 ? (
                    <div className="space-y-2">
                      {selectedServices.map((service) => (
                        <div
                          key={service._id}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{service.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              {service.deviceInfo?.brandId && (
                                <span className="text-xs text-gray-600">
                                  {service.deviceInfo.brandId.name}
                                </span>
                              )}
                              {service.deviceInfo?.modelId && (
                                <span className="text-xs text-gray-500">
                                  {service.deviceInfo.modelId.name}
                                </span>
                              )}
                              {service.pricing && (
                                <span className="text-xs font-semibold text-green-600">
                                  {service.pricing.currency} {service.pricing.total}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(service._id)}
                            className="text-red-600 hover:text-red-700 ml-3"
                          >
                            <Icon icon="mdi:close-circle" className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedServices.length} service(s) selected
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Icon icon="mdi:format-list-bulleted" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">No services selected</p>
                      <button
                        type="button"
                        onClick={() => setShowServiceModal(true)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Select from your services
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Profile Info (when type is 'profile') */}
          {watchType === 'profile' && currentAd.profileId && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Profile</p>
                <p className="font-semibold text-gray-900">{currentAd.profileId.name}</p>
                <p className="text-sm text-gray-600 mt-1">Profile details cannot be changed</p>
              </div>
            </div>
          )}    

          {/* Submit Buttons */}
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
              Update Advertisement
            </button>
          </div>
        </form>
      </div>
       <ServiceSelectionModal
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          services={services}
          selectedServices={selectedServices}
          onSelectService={handleSelectService}
          loading={loadingServices}
        />
    </div>
  );
}

export default EditAdvertisement;
