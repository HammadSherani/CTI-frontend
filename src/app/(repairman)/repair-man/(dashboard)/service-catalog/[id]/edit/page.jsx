"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';

// Validation Schema
const serviceSchema = yup.object().shape({
  title: yup
    .string()
    .required('Service title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must not exceed 500 characters'),
  deviceInfo: yup.object().shape({
    brandId: yup.string().required('Please select a brand'),
    modelId: yup.string().required('Please select a model'),
  }),
  serviceType: yup
    .string()
    .required('Please select a service type')
    .oneOf(['home', 'shop', 'pickup'], 'Invalid service type'),
  city: yup.string().optional(),
  pricing: yup.object().shape({
    basePrice: yup
      .number()
      .required('Base price is required')
      .positive('Base price must be greater than 0')
      .typeError('Base price must be a number'),
    partsPrice: yup
      .number()
      .min(0, 'Parts price cannot be negative')
      .typeError('Parts price must be a number')
      .default(0),
    serviceCharges: yup
      .number()
      .min(0, 'Service charges cannot be negative')
      .typeError('Service charges must be a number')
      .default(0),
    total: yup.number().required('Total is required'),
    currency: yup.string().default('TRY'),
  }),
});

function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.id;
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [fetchingService, setFetchingService] = useState(true);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [serviceData, setServiceData] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(serviceSchema),
    defaultValues: {
      title: '',
      description: '',
      deviceInfo: {
        brandId: '',
        modelId: '',
      },
      serviceType: '',
      city: '',
      pricing: {
        basePrice: '',
        partsPrice: 0,
        serviceCharges: 0,
        total: 0,
        currency: 'TRY',
      },
    },
  });

  const watchBrandId = watch('deviceInfo.brandId');
  const watchBasePrice = watch('pricing.basePrice');
  const watchPartsPrice = watch('pricing.partsPrice');
  const watchServiceCharges = watch('pricing.serviceCharges');

  // Fetch service data
  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId]);

  // Fetch brands on mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (watchBrandId) {
      fetchModels(watchBrandId);
    } else {
      setModels([]);
    }
  }, [watchBrandId]);

  // Calculate total
  useEffect(() => {
    const basePrice = parseFloat(watchBasePrice) || 0;
    const partsPrice = parseFloat(watchPartsPrice) || 0;
    const serviceCharges = parseFloat(watchServiceCharges) || 0;
    const total = basePrice + partsPrice + serviceCharges;
    setValue('pricing.total', total > 0 ? total : 0);
  }, [watchBasePrice, watchPartsPrice, watchServiceCharges]);

  const fetchServiceData = async () => {
    try {
      setFetchingService(true);
      const { data } = await axiosInstance.get(`/repairman/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const service = data.data;
        setServiceData(service);

        // Populate form with existing data
        reset({
          title: service.title || '',
          description: service.description || '',
          deviceInfo: {
            brandId: service.deviceInfo?.brandId?._id || service.deviceInfo?.brandId || '',
            modelId: service.deviceInfo?.modelId?._id || service.deviceInfo?.modelId || '',
          },
          serviceType: service.serviceType || '',
          city: service.city || '',
          pricing: {
            basePrice: service.pricing?.basePrice || 0,
            partsPrice: service.pricing?.partsPrice || 0,
            serviceCharges: service.pricing?.serviceCharges || 0,
            total: service.pricing?.total || 0,
            currency: service.pricing?.currency || 'TRY',
          },
        });

        // Fetch models for the selected brand
        if (service.deviceInfo?.brandId?._id || service.deviceInfo?.brandId) {
          const brandId = service.deviceInfo.brandId._id || service.deviceInfo.brandId;
          fetchModels(brandId);
        }
      }
    } catch (error) {
      handleError(error);
      router.push('/repair-man/service-catalog');
    } finally {
      setFetchingService(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const { data } = await axiosInstance.get('/public/brands', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setBrands(data.data.brands || []);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModels = async (brandId) => {
    try {
      setLoadingModels(true);
      const { data } = await axiosInstance.get(`/public/models/brand/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setModels(data.data?.models || []);
      }
    } catch (error) {
      handleError(error);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/repairman/services/${serviceId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Service updated successfully!');
        router.push('/repair-man/service-catalog');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes = [
    { 
      value: 'home', 
      label: 'Home Service', 
      icon: 'heroicons:home',
      description: 'We come to your location'
    },
    { 
      value: 'shop', 
      label: 'Shop Service', 
      icon: 'heroicons:building-storefront',
      description: 'Visit our repair shop'
    },
    { 
      value: 'pickup', 
      label: 'Pickup Service', 
      icon: 'heroicons:truck',
      description: 'We pickup and deliver'
    },
  ];

  if (fetchingService) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading service data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Icon icon="heroicons:arrow-left" className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Service</h1>
              <p className="text-gray-600 text-lg">Update your repair service details</p>
            </div>
          </div>

          {/* Status Alert */}
          {serviceData && (
            <div className={`p-4 rounded-lg border ${
              serviceData.status === 'approved' 
                ? 'bg-green-50 border-green-200' 
                : serviceData.status === 'rejected'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start">
                <Icon 
                  icon={serviceData.status === 'approved' ? 'heroicons:check-circle' : serviceData.status === 'rejected' ? 'heroicons:x-circle' : 'heroicons:clock'} 
                  className={`w-5 h-5 mr-2 ${
                    serviceData.status === 'approved' ? 'text-green-600' : serviceData.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`} 
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    serviceData.status === 'approved' ? 'text-green-800' : serviceData.status === 'rejected' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    Status: {serviceData.status.charAt(0).toUpperCase() + serviceData.status.slice(1)}
                  </p>
                  {serviceData.status === 'rejected' && serviceData.rejectionReason && (
                    <p className="text-sm text-red-700 mt-1">
                      Reason: {serviceData.rejectionReason}
                    </p>
                  )}
                  {serviceData.status === 'rejected' && (
                    <p className="text-sm text-red-700 mt-1">
                      Your service will be resubmitted for approval after updating.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            {/* Service Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Icon icon="heroicons:information-circle" className="w-6 h-6 mr-2 text-primary-600" />
                Service Information
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., iPhone 14 Screen Replacement"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.title ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    )}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon icon="heroicons:exclamation-circle" className="w-4 h-4 mr-1" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows="4"
                        placeholder="Provide a detailed description of the service..."
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon icon="heroicons:exclamation-circle" className="w-4 h-4 mr-1" />
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City (Optional)
                  </label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., Istanbul, Ankara"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Device Information Section */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Icon icon="heroicons:device-phone-mobile" className="w-6 h-6 mr-2 text-primary-600" />
                Device Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="deviceInfo.brandId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        disabled={loadingBrands}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.deviceInfo?.brandId ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      >
                        <option value="">Select a brand</option>
                        {brands.map((brand) => (
                          <option key={brand._id} value={brand._id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.deviceInfo?.brandId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon icon="heroicons:exclamation-circle" className="w-4 h-4 mr-1" />
                      {errors.deviceInfo.brandId.message}
                    </p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="deviceInfo.modelId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        disabled={!watchBrandId || loadingModels}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.deviceInfo?.modelId ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      >
                        <option value="">
                          {!watchBrandId ? 'Select brand first' : loadingModels ? 'Loading...' : 'Select a model'}
                        </option>
                        {models.map((model) => (
                          <option key={model._id} value={model._id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.deviceInfo?.modelId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon icon="heroicons:exclamation-circle" className="w-4 h-4 mr-1" />
                      {errors.deviceInfo.modelId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Service Type Section */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Icon icon="heroicons:wrench-screwdriver" className="w-6 h-6 mr-2 text-primary-600" />
                Service Type
              </h2>

              <Controller
                name="serviceType"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {serviceTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => field.onChange(type.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          field.value === type.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon icon={type.icon} className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                        <p className="text-sm font-medium text-center mb-1">{type.label}</p>
                        <p className="text-xs text-gray-500 text-center">{type.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.serviceType && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <Icon icon="heroicons:exclamation-circle" className="w-4 h-4 mr-1" />
                  {errors.serviceType.message}
                </p>
              )}
            </div>

            {/* Pricing Section */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Icon icon="heroicons:currency-dollar" className="w-6 h-6 mr-2 text-primary-600" />
                Pricing Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Base Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (TRY) <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="pricing.basePrice"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.pricing?.basePrice ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    )}
                  />
                  {errors.pricing?.basePrice && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon icon="heroicons:exclamation-circle" className="w-4 h-4 mr-1" />
                      {errors.pricing.basePrice.message}
                    </p>
                  )}
                </div>

                {/* Parts Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parts Price (TRY)
                  </label>
                  <Controller
                    name="pricing.partsPrice"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.pricing?.partsPrice ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    )}
                  />
                  {errors.pricing?.partsPrice && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon icon="heroicons:exclamation-circle" className="w-4 h-4 mr-1" />
                      {errors.pricing.partsPrice.message}
                    </p>
                  )}
                </div>

                {/* Service Charges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Charges (TRY)
                  </label>
                  <Controller
                    name="pricing.serviceCharges"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.pricing?.serviceCharges ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    )}
                  />
                  {errors.pricing?.serviceCharges && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <Icon icon="heroicons:exclamation-circle" className="w-4 h-4 mr-1" />
                      {errors.pricing.serviceCharges.message}
                    </p>
                  )}
                </div>

                {/* Total (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (TRY)
                  </label>
                  <Controller
                    name="pricing.total"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        readOnly
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-semibold"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                <p>Total = Base Price + Parts Price + Service Charges</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Icon icon="heroicons:arrow-path" className="w-5 h-5 mr-2 animate-spin" />
                    Updating Service...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:check" className="w-5 h-5 mr-2" />
                    Update Service
                  </>
                )}
              </button>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
              <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                {serviceData?.status === 'rejected' 
                  ? 'After updating, your service will be resubmitted for admin approval with pending status.'
                  : 'Changes will be saved and may require admin approval depending on the modifications.'}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditServicePage;