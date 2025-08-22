'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

// Validation schema - Updated to match API
const schema = yup.object().shape({
  categoryId: yup.string().required('Category is required'),
  title: yup.string().required('Job title is required').min(5, 'Title must be at least 5 characters'),
  turkishTitle: yup.string().optional(),
  description: yup.string().required('Description is required').min(20, 'Please provide more details (minimum 20 characters)'),
  turkishDescription: yup.string().optional(),
  deviceInfo: yup.object().shape({
    brand: yup.string().required('Device brand is required'),
    model: yup.string().required('Device model is required'),
    color: yup.string().optional(),
    purchaseYear: yup.number().min(2000, 'Invalid year').max(new Date().getFullYear(), 'Cannot be future year').optional(),
    warrantyStatus: yup.string().required('Warranty status is required'),
  }),
  urgency: yup.string().required('Urgency level is required'),
  budget: yup.object().shape({
    min: yup.number().min(0, 'Minimum budget cannot be negative').optional(),
    max: yup.number().min(0, 'Maximum budget cannot be negative').optional(),
    currency: yup.string().required('Currency is required'),
  }),
  location: yup.object().shape({
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    district: yup.string().optional(),
    zipCode: yup.string().optional(),
    coordinates: yup.object().optional(),
  }),
  preferredTime: yup.date().min(new Date(), 'Preferred time must be in the future').required('Preferred time is required'),
  servicePreference: yup.string().required('Service preference is required'),
  images: yup.array().min(1, 'At least one device image is required'),
  maxOffers: yup.number().min(1).max(20).optional(),
  autoSelectBest: yup.boolean().optional(),
});

const deviceBrands = [
  'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 
  'Oppo', 'Vivo', 'Nokia', 'Sony', 'LG', 'Motorola', 'Other'
];

const servicePreferences = [
  { value: 'pickup_delivery', label: 'Pickup & Delivery', icon: 'mdi:truck-delivery', desc: 'We collect and deliver your device' },
  { value: 'onsite_repair', label: 'On-site Repair', icon: 'mdi:home-repair', desc: 'Technician visits your location' },
  { value: 'walk_in', label: 'Walk-in Service', icon: 'mdi:store', desc: 'Visit our repair center' },
  { value: 'both', label: 'Flexible', icon: 'mdi:swap-horizontal', desc: 'Any available option' }
];

const urgencyLevels = [
  { value: 'low', label: 'Low Priority', icon: 'mdi:speedometer-slow', color: 'text-green-600', desc: '3-5 business days' },
  { value: 'medium', label: 'Medium Priority', icon: 'mdi:speedometer-medium', color: 'text-yellow-600', desc: '1-2 business days' },
  { value: 'high', label: 'High Priority', icon: 'mdi:speedometer', color: 'text-red-600', desc: 'Same day service' },
  { value: 'urgent', label: 'Emergency', icon: 'mdi:alarm-light', color: 'text-red-700', desc: 'Immediate attention' }
];

const warrantyOptions = [
  { value: 'under_warranty', label: 'Under Warranty', icon: 'mdi:shield-check', color: 'text-green-600' },
  { value: 'expired', label: 'Warranty Expired', icon: 'mdi:shield-off', color: 'text-red-600' },
  { value: 'not_sure', label: 'Not Sure', icon: 'mdi:help-circle', color: 'text-gray-600' },
  { value: 'no_warranty', label: 'No Warranty', icon: 'mdi:shield-remove', color: 'text-gray-600' }
];

export default function CreateRepairJobForm() {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [deviceImages, setDeviceImages] = useState([]);
  
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
      categoryId: '',
      title: '',
      turkishTitle: '',
      description: '',
      turkishDescription: '',
      deviceInfo: {
        brand: '',
        model: '',
        color: '',
        purchaseYear: '',
        warrantyStatus: '',
      },
      urgency: 'medium',
      budget: {
        min: '',
        max: '',
        currency: 'PKR'
      },
      location: {
        address: '',
        city: '',
        district: '',
        zipCode: '',
        coordinates: null
      },
      preferredTime: '',
      servicePreference: 'both',
      images: [],
      maxOffers: 10,
      autoSelectBest: false
    }
  });

  const watchedBudgetMin = watch('budget.min');
  const watchedBudgetMax = watch('budget.max');

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/repair-jobs/categories');
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Upload images to Cloudinary
  const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'repair_jobs'); // Create this preset in Cloudinary
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    formData.append('folder', 'repair_jobs');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    try {
      toast.loading('Creating your repair job...', { id: 'create-job' });

      // Upload images to Cloudinary first
      const imageUrls = [];
      if (deviceImages.length > 0) {
        for (const file of deviceImages) {
          const url = await uploadToCloudinary(file);
          if (url) imageUrls.push(url);
        }
      }

      // Prepare data for API
      const jobData = {
        categoryId: data.categoryId,
        title: data.title,
        turkishTitle: data.turkishTitle || '',
        description: data.description,
        turkishDescription: data.turkishDescription || '',
        deviceInfo: data.deviceInfo,
        urgency: data.urgency,
        budget: {
          min: data.budget.min ? parseFloat(data.budget.min) : undefined,
          max: data.budget.max ? parseFloat(data.budget.max) : undefined,
          currency: data.budget.currency
        },
        location: data.location,
        preferredTime: new Date(data.preferredTime).toISOString(),
        servicePreference: data.servicePreference,
        images: imageUrls,
        maxOffers: data.maxOffers || 10,
        autoSelectBest: data.autoSelectBest || false
      };

      console.log('Submitting job data:', jobData);

      const response = await axiosInstance.post('/repair-jobs', jobData);

      toast.success('Repair job created successfully!', { id: 'create-job' });
      
      console.log('Job created:', response.data);

      // Reset form
      reset();
      setDeviceImages([]);
      setStep(1);

      // Optional: Redirect to job details or my jobs
      // router.push(`/jobs/${response.data.data.job._id}`);
      
    } catch (error) {
      console.error('Error creating job:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to create repair job. Please try again.';
      toast.error(errorMessage, { id: 'create-job' });
    }
  };

  const handleFileUpload = (files) => {
    setDeviceImages(files);
    setValue('images', files);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Get minimum date for preferred time (current date + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="mdi:tools" className="text-3xl text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Repair Job</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get your device repaired by certified technicians. Fill out the details below to receive offers.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= stepNumber 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNumber ? (
                    <Icon icon="mdi:check" className="text-lg" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 transition-all ${
                    step > stepNumber ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* Step 1: Job Details */}
            {step === 1 && (
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <Icon icon="mdi:clipboard-text" className="text-2xl text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
                </div>

                <div className="space-y-8">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      Repair Category
                    </label>
                    {loadingCategories ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                          <Controller
                            key={category._id}
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                              <div
                                onClick={() => field.onChange(category._id)}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                  field.value === category._id
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon 
                                    icon={category.icon || 'mdi:tools'} 
                                    className={`text-2xl ${
                                      field.value === category._id ? 'text-orange-500' : 'text-gray-400'
                                    }`} 
                                  />
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                    {category.nameUrdu && (
                                      <p className="text-sm text-gray-600">{category.nameUrdu}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          />
                        ))}
                      </div>
                    )}
                    {errors.categoryId && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <Icon icon="mdi:alert-circle" />
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  {/* Job Title */}
                  <div>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Job Title
                          </label>
                          <div className="relative">
                            <input
                              {...field}
                              type="text"
                              placeholder="e.g., iPhone 14 Pro screen replacement"
                              className={`w-full px-4 py-3 pl-12 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                                errors.title 
                                  ? "border-red-300 focus:border-red-500" 
                                  : "border-gray-200 focus:border-orange-500"
                              }`}
                            />
                            <Icon 
                              icon="mdi:format-title" 
                              className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                            />
                          </div>
                          {errors.title && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <Icon icon="mdi:alert-circle" />
                              {errors.title.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Turkish Title (Optional) */}
                  <div>
                    <Controller
                      name="turkishTitle"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Turkish Title (Optional)
                          </label>
                          <div className="relative">
                            <input
                              {...field}
                              type="text"
                              placeholder="e.g., iPhone 14 Pro ekran değişimi"
                              className="w-full px-4 py-3 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white focus:border-orange-500"
                            />
                            <Icon 
                              icon="mdi:translate" 
                              className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                            />
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Problem Description
                          </label>
                          <textarea
                            {...field}
                            rows={4}
                            placeholder="Please describe the issue with your device in detail. Include any specific symptoms, when the problem started, and what you've tried so far..."
                            className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white resize-none ${
                              errors.description 
                                ? "border-red-300 focus:border-red-500" 
                                : "border-gray-200 focus:border-orange-500"
                            }`}
                          />
                          {errors.description && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <Icon icon="mdi:alert-circle" />
                              {errors.description.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Turkish Description (Optional) */}
                  <div>
                    <Controller
                      name="turkishDescription"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Turkish Description (Optional)
                          </label>
                          <textarea
                            {...field}
                            rows={3}
                            placeholder="Cihazınızdaki sorunu detaylı olarak açıklayın..."
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white focus:border-orange-500 resize-none"
                          />
                        </div>
                      )}
                    />
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      Urgency Level
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {urgencyLevels.map((level) => (
                        <Controller
                          key={level.value}
                          name="urgency"
                          control={control}
                          render={({ field }) => (
                            <div
                              onClick={() => field.onChange(level.value)}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                field.value === level.value
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon icon={level.icon} className={`text-xl ${level.color}`} />
                                <div>
                                  <h3 className="font-semibold text-gray-900">{level.label}</h3>
                                  <p className="text-sm text-gray-600">{level.desc}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                    {errors.urgency && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <Icon icon="mdi:alert-circle" />
                        {errors.urgency.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Device Information */}
            {step === 2 && (
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <Icon icon="mdi:cellphone" className="text-2xl text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Device Information</h2>
                </div>

                <div className="space-y-6">
                  {/* Device Brand & Model */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Controller
                        name="deviceInfo.brand"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Device Brand
                            </label>
                            <div className="relative">
                              <select
                                {...field}
                                className={`w-full px-4 py-3 pl-12 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                                  errors.deviceInfo?.brand 
                                    ? "border-red-300 focus:border-red-500" 
                                    : "border-gray-200 focus:border-orange-500"
                                }`}
                              >
                                <option value="">Select Brand</option>
                                {deviceBrands.map(brand => (
                                  <option key={brand} value={brand}>{brand}</option>
                                ))}
                              </select>
                              <Icon 
                                icon="mdi:factory" 
                                className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                              />
                            </div>
                            {errors.deviceInfo?.brand && (
                              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <Icon icon="mdi:alert-circle" />
                                {errors.deviceInfo.brand.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div>
                      <Controller
                        name="deviceInfo.model"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Device Model
                            </label>
                            <div className="relative">
                              <input
                                {...field}
                                type="text"
                                placeholder="e.g., iPhone 14 Pro, Galaxy S23"
                                className={`w-full px-4 py-3 pl-12 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                                  errors.deviceInfo?.model 
                                    ? "border-red-300 focus:border-red-500" 
                                    : "border-gray-200 focus:border-orange-500"
                                }`}
                              />
                              <Icon 
                                icon="mdi:cellphone-settings" 
                                className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                              />
                            </div>
                            {errors.deviceInfo?.model && (
                              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <Icon icon="mdi:alert-circle" />
                                {errors.deviceInfo.model.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {/* Color & Purchase Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Controller
                        name="deviceInfo.color"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Device Color (Optional)
                            </label>
                            <div className="relative">
                              <input
                                {...field}
                                type="text"
                                placeholder="e.g., Space Black, Ocean Blue"
                                className="w-full px-4 py-3 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white focus:border-orange-500"
                              />
                              <Icon 
                                icon="mdi:palette" 
                                className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                              />
                            </div>
                          </div>
                        )}
                      />
                    </div>
                    <div>
                      <Controller
                        name="deviceInfo.purchaseYear"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Purchase Year (Optional)
                            </label>
                            <div className="relative">
                              <input
                                {...field}
                                type="number"
                                placeholder="e.g., 2023"
                                className={`w-full px-4 py-3 pl-12 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                                  errors.deviceInfo?.purchaseYear 
                                    ? "border-red-300 focus:border-red-500" 
                                    : "border-gray-200 focus:border-orange-500"
                                }`}
                              />
                              <Icon 
                                icon="mdi:calendar" 
                                className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                              />
                            </div>
                            {errors.deviceInfo?.purchaseYear && (
                              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <Icon icon="mdi:alert-circle" />
                                {errors.deviceInfo.purchaseYear.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {/* Warranty Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      Warranty Status
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {warrantyOptions.map((warranty) => (
                        <Controller
                          key={warranty.value}
                          name="deviceInfo.warrantyStatus"
                          control={control}
                          render={({ field }) => (
                            <div
                              onClick={() => field.onChange(warranty.value)}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                field.value === warranty.value
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon icon={warranty.icon} className={`text-xl ${warranty.color}`} />
                                <h3 className="font-semibold text-gray-900">{warranty.label}</h3>
                              </div>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                    {errors.deviceInfo?.warrantyStatus && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <Icon icon="mdi:alert-circle" />
                        {errors.deviceInfo.warrantyStatus.message}
                      </p>
                    )}
                  </div>

                  {/* Budget Range */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Icon icon="mdi:currency-usd" className="text-orange-500" />
                      Budget Range (Optional)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Controller
                        name="budget.min"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <input
                              {...field}
                              type="number"
                              placeholder="Minimum"
                              className={`w-full px-4 py-3 pl-12 bg-white border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                                errors.budget?.min 
                                  ? "border-red-300 focus:border-red-500" 
                                  : "border-gray-200 focus:border-orange-500"
                              }`}
                            />
                            <Icon 
                              icon="mdi:currency-usd" 
                              className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                            />
                            {errors.budget?.min && (
                              <p className="mt-1 text-xs text-red-600">{errors.budget.min.message}</p>
                            )}
                          </div>
                        )}
                      />
                      <Controller
                        name="budget.max"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <input
                              {...field}
                              type="number"
                              placeholder="Maximum"
                              className={`w-full px-4 py-3 pl-12 bg-white border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                                errors.budget?.max 
                                  ? "border-red-300 focus:border-red-500" 
                                  : "border-gray-200 focus:border-orange-500"
                              }`}
                            />
                            <Icon 
                              icon="mdi:currency-usd" 
                              className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                            />
                            {errors.budget?.max && (
                              <p className="mt-1 text-xs text-red-600">{errors.budget.max.message}</p>
                            )}
                          </div>
                        )}
                      />
                      <Controller
                        name="budget.currency"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-orange-500"
                          >
                            <option value="PKR">PKR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        )}
                      />
                    </div>
                    {(watchedBudgetMin && watchedBudgetMax && parseInt(watchedBudgetMin) > parseInt(watchedBudgetMax)) && (
                      <p className="mt-2 text-sm text-red-600">Minimum budget cannot be greater than maximum budget</p>
                    )}
                  </div>

                  {/* Device Images */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      Device Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors">
                      <Icon icon="mdi:cloud-upload" className="text-4xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload clear photos of your device and the damage</p>
                      <p className="text-sm text-gray-500 mb-4">Support: JPG, PNG, HEIC (Max 5MB each)</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                        className="hidden"
                        id="device-images"
                      />
                      <label
                        htmlFor="device-images"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition-colors"
                      >
                        <Icon icon="mdi:upload" />
                        Choose Files
                      </label>
                      {deviceImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                          {deviceImages.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Device ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = deviceImages.filter((_, i) => i !== index);
                                  setDeviceImages(newFiles);
                                  setValue('images', newFiles);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.images && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <Icon icon="mdi:alert-circle" />
                        {errors.images.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location & Preferences */}
            {step === 3 && (
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <Icon icon="mdi:map-marker" className="text-2xl text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Location & Preferences</h2>
                </div>

                <div className="space-y-6">
                  {/* Service Preference */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      Service Preference
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {servicePreferences.map((pref) => (
                        <Controller
                          key={pref.value}
                          name="servicePreference"
                          control={control}
                          render={({ field }) => (
                            <div
                              onClick={() => field.onChange(pref.value)}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                field.value === pref.value
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Icon 
                                  icon={pref.icon} 
                                  className={`text-2xl mt-1 ${
                                    field.value === pref.value ? 'text-orange-500' : 'text-gray-400'
                                  }`} 
                                />
                                <div>
                                  <h3 className="font-semibold text-gray-900">{pref.label}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{pref.desc}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                    {errors.servicePreference && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <Icon icon="mdi:alert-circle" />
                        {errors.servicePreference.message}
                      </p>
                    )}
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <Controller
                      name="preferredTime"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Preferred Time
                          </label>
                          <div className="relative">
                            <input
                              {...field}
                              type="datetime-local"
                              min={getMinDateTime()}
                              className={`w-full px-4 py-3 pl-12 bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white ${
                                errors.preferredTime 
                                  ? "border-red-300 focus:border-red-500" 
                                  : "border-gray-200 focus:border-orange-500"
                              }`}
                            />
                            <Icon 
                              icon="mdi:clock" 
                              className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                            />
                          </div>
                          {errors.preferredTime && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <Icon icon="mdi:alert-circle" />
                              {errors.preferredTime.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Service Address */}
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Icon icon="mdi:home-map-marker" className="text-blue-500" />
                      Service Location
                    </h3>
                    
                    <div className="space-y-4">
                      <Controller
                        name="location.address"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Street Address
                            </label>
                            <div className="relative">
                              <input
                                {...field}
                                type="text"
                                placeholder="123 Main Street, Apartment 4B"
                                className={`w-full px-4 py-3 pl-12 bg-white border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                                  errors.location?.address 
                                    ? "border-red-300 focus:border-red-500" 
                                    : "border-gray-200 focus:border-blue-500"
                                }`}
                              />
                              <Icon 
                                icon="mdi:road" 
                                className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                              />
                            </div>
                            {errors.location?.address && (
                              <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
                            )}
                          </div>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                          name="location.city"
                          control={control}
                          render={({ field }) => (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                City
                              </label>
                              <div className="relative">
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="e.g., Karachi"
                                  className={`w-full px-4 py-3 pl-12 bg-white border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                                    errors.location?.city 
                                      ? "border-red-300 focus:border-red-500" 
                                      : "border-gray-200 focus:border-blue-500"
                                  }`}
                                />
                                <Icon 
                                  icon="mdi:city" 
                                  className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                                />
                              </div>
                              {errors.location?.city && (
                                <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
                              )}
                            </div>
                          )}
                        />
                        <Controller
                          name="location.district"
                          control={control}
                          render={({ field }) => (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                District (Optional)
                              </label>
                              <div className="relative">
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="e.g., Clifton"
                                  className="w-full px-4 py-3 pl-12 bg-white border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-blue-500"
                                />
                                <Icon 
                                  icon="mdi:map" 
                                  className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                                />
                              </div>
                            </div>
                          )}
                        />
                      </div>

                      <Controller
                        name="location.zipCode"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Zip/Postal Code (Optional)
                            </label>
                            <div className="relative">
                              <input
                                {...field}
                                type="text"
                                placeholder="e.g., 75600"
                                className="w-full px-4 py-3 pl-12 bg-white border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-blue-500"
                              />
                              <Icon 
                                icon="mdi:mailbox" 
                                className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                              />
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Icon icon="mdi:cog" className="text-gray-600" />
                      Additional Options
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                          name="maxOffers"
                          control={control}
                          render={({ field }) => (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Offers
                              </label>
                              <div className="relative">
                                <input
                                  {...field}
                                  type="number"
                                  min="1"
                                  max="20"
                                  placeholder="10"
                                  className="w-full px-4 py-3 pl-12 bg-white border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-orange-500"
                                />
                                <Icon 
                                  icon="mdi:numeric" 
                                  className="absolute left-4 top-3.5 text-gray-400 text-lg" 
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-500">How many offers do you want to receive? (1-20)</p>
                            </div>
                          )}
                        />
                        
                        <div className="flex items-center">
                          <Controller
                            name="autoSelectBest"
                            control={control}
                            render={({ field }) => (
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <div>
                                  <span className="font-medium text-gray-900">Auto-select best offer</span>
                                  <p className="text-sm text-gray-600">Automatically accept the best offer when available</p>
                                </div>
                              </label>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Icon icon="mdi:clipboard-check" className="text-orange-500" />
                      Job Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><strong>Title:</strong> {watch('title') || 'Not specified'}</div>
                      <div><strong>Category:</strong> {categories.find(c => c._id === watch('categoryId'))?.name || 'Not selected'}</div>
                      <div><strong>Device:</strong> {watch('deviceInfo.brand')} {watch('deviceInfo.model') || 'Not specified'}</div>
                      <div><strong>Urgency:</strong> {urgencyLevels.find(u => u.value === watch('urgency'))?.label || 'Medium'}</div>
                      <div><strong>Service:</strong> {servicePreferences.find(s => s.value === watch('servicePreference'))?.label || 'Flexible'}</div>
                      <div><strong>Images:</strong> {deviceImages.length} uploaded</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="px-8 md:px-10 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors"
                >
                  <Icon icon="mdi:arrow-left" />
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Next
                  <Icon icon="mdi:arrow-right" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Job...
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:send" />
                      Create Job
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <Icon icon="mdi:help-circle" className="text-lg" />
            <span>Need help? </span>
            <a href="#" className="text-orange-500 hover:text-orange-600 font-medium">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}