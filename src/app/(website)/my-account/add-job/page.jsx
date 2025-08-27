'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

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
    coordinates: yup.array().of(yup.number().required()).length(2, 'Coordinates must contain exactly two values (longitude and latitude)').nullable().optional(),
  }),
  preferredTime: yup.date().min(new Date(), 'Preferred time must be in the future').required('Preferred time is required'),
  servicePreference: yup.string().required('Service preference is required'),
  // images: yup.array().min(1, 'At least one device image is required'),
  maxOffers: yup.number().min(1).max(20).optional(),
  autoSelectBest: yup.boolean().optional(),
});

const deviceBrands = [
  'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei',
  'Oppo', 'Vivo', 'Nokia', 'Sony', 'LG', 'Motorola', 'Other'
];

const servicePreferences = [
  { value: 'pickup', label: 'Pickup & Delivery', icon: 'mdi:truck-delivery', desc: 'We collect and deliver your device' },
  { value: 'drop-off', label: 'On-site Repair', icon: 'mdi:home-repair', desc: 'Technician visits your location' },
  { value: 'both', label: 'Both', icon: 'mdi:home-repair', desc: 'Technician visits your location' },
];

const urgencyLevels = [
  { value: 'low', label: 'Low Priority', icon: 'mdi:speedometer-slow', color: 'text-green-600', desc: '3-5 business days' },
  { value: 'medium', label: 'Medium Priority', icon: 'mdi:speedometer-medium', color: 'text-yellow-600', desc: '1-2 business days' },
  { value: 'high', label: 'High Priority', icon: 'mdi:speedometer', color: 'text-red-600', desc: 'Same day service' },
  { value: 'urgent', label: 'Emergency', icon: 'mdi:alarm-light', color: 'text-red-700', desc: 'Immediate attention' }
];

const warrantyOptions = [
  { value: 'active', label: 'Under Warranty', icon: 'mdi:shield-check', color: 'text-green-600' },
  { value: 'expired', label: 'Warranty Expired', icon: 'mdi:shield-off', color: 'text-red-600' },
  { value: 'unknown', label: 'Not Sure', icon: 'mdi:help-circle', color: 'text-gray-600' },
  // { value: 'no_warranty', label: 'No Warranty', icon: 'mdi:shield-remove', color: 'text-gray-600' }
];

export default function CreateRepairJobForm() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [deviceImages, setDeviceImages] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const { token } = useSelector(state => state.auth);

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
      servicePreference: 'pickup_delivery',
      images: [],
      maxOffers: 10,
      autoSelectBest: false
    }
  });

  const watchedBudgetMin = watch('budget.min');
  const watchedBudgetMax = watch('budget.max');
  const watchedAddress = watch('location.address');
  const watchedCity = watch('location.city');
  const coordinates = watch('location.coordinates');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/repair-jobs/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCategories(response.data.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [token]);

  // Get current location function
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('location.coordinates', [
          latitude,
          longitude
        ]);
        setIsGettingLocation(false);
        toast.success('Location detected successfully!');
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Get location from address (geocoding)
  const getLocationFromAddress = async (address) => {
    try {
      // Using a free geocoding service (you can replace with Google Maps API if you have a key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);
        setValue('location.coordinates', {
          latitude: latitude,
          longitude: longitude
        });
        toast.success('Location coordinates updated from address!');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'repair_jobs');
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    formData.append('folder', 'repair_jobs');
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    try {
      // toast.loading('Creating your repair job...', { id: 'create-job' });

      console.log(data);

      // return;


      // Upload images to Cloudinary first
      const uploadedImageUrls = await Promise.all(
        deviceImages.map(async (file) => await uploadToCloudinary(file))
      );

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
          currency: data.budget.currency,
        },
        location: {
          address: data.location.address,
          city: data.location.city,
          district: data.location.district || '',
          zipCode: data.location.zipCode || '',
          coordinates: data.location.coordinates || null,
        },
        preferredTime: new Date(data.preferredTime).toISOString(),
        servicePreference: data.servicePreference,
        images: uploadedImageUrls,
        maxOffers: data.maxOffers || 10,
        autoSelectBest: data.autoSelectBest || false,
      };

      // Make the API call to submit the job
      const response = await axiosInstance.post('/repair-jobs', jobData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Repair job created successfully!', { id: 'create-job' });
      reset();
      setDeviceImages([]);
    } catch (error) {
      console.error('Error creating job:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to create repair job. Please try again.';
      toast.error(errorMessage, { id: 'create-job' });
    }
  };

  const handleFileUpload = (files) => {
    setDeviceImages(files);
    setValue('images', files);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon icon="mdi:tools" className="text-2xl text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Repair Job</h1>
          <p className="text-base text-gray-600 max-w-3xl mx-auto">
            Get your device repaired by certified technicians. Fill out the details below to receive offers.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Job Details Section */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon icon="mdi:clipboard-text" className="text-xl text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <div className="relative">
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., iPhone 14 Pro screen replacement"
                            className={`w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
                          />
                          <Icon icon="mdi:format-title" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                        {errors.title && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.title.message}</p>}
                      </div>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repair Category</label>
                  {loadingCategories ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="w-6 h-6 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <select
                            {...field}
                            className={`w-full p-2.5 pl-3 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.categoryId ? 'border-red-300' : 'border-gray-200'}`}
                            onChange={(e) => field.onChange(e.target.value)}
                            value={field.value || ""}
                          >
                            <option value="" disabled>Select a category</option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name} {category.nameUrdu ? `(${category.nameUrdu})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    />
                  )}
                  {errors.categoryId && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.categoryId.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
                        <textarea
                          {...field}
                          rows={3}
                          placeholder="Describe the issue with your device..."
                          className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.description.message}</p>}
                      </div>
                    )}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {urgencyLevels.map((level) => (
                    <Controller
                      key={level.value}
                      name="urgency"
                      control={control}
                      render={({ field }) => (
                        <div
                          onClick={() => field.onChange(level.value)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${field.value === level.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon icon={level.icon} className={`text-base ${level.color}`} />
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{level.label}</h3>
                              <p className="text-xs text-gray-600">{level.desc}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  ))}
                </div>
                {errors.urgency && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.urgency.message}</p>}
              </div>
            </div>

            {/* Device Information Section */}
            <div className="p-6 md:p-8 border-t border-gray-200 space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon icon="mdi:cellphone" className="text-xl text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">Device Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Controller
                    name="deviceInfo.brand"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Device Brand</label>
                        <div className="relative">
                          <select
                            {...field}
                            className={`w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.deviceInfo?.brand ? 'border-red-300' : 'border-gray-200'}`}
                          >
                            <option value="">Select Brand</option>
                            {deviceBrands.map(brand => (
                              <option key={brand} value={brand}>{brand}</option>
                            ))}
                          </select>
                          <Icon icon="mdi:factory" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                        {errors.deviceInfo?.brand && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.deviceInfo.brand.message}</p>}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Device Model</label>
                        <div className="relative">
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., iPhone 14 Pro"
                            className={`w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.deviceInfo?.model ? 'border-red-300' : 'border-gray-200'}`}
                          />
                          <Icon icon="mdi:cellphone-settings" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                        {errors.deviceInfo?.model && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.deviceInfo.model.message}</p>}
                      </div>
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="deviceInfo.color"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Device Color (Optional)</label>
                        <div className="relative">
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., Space Black"
                            className="w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-200"
                          />
                          <Icon icon="mdi:palette" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Controller
                    name="deviceInfo.purchaseYear"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Year (Optional)</label>
                        <div className="relative">
                          <input
                            {...field}
                            type="number"
                            placeholder="e.g., 2023"
                            className={`w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.deviceInfo?.purchaseYear ? 'border-red-300' : 'border-gray-200'}`}
                          />
                          <Icon icon="mdi:calendar" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                        {errors.deviceInfo?.purchaseYear && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.deviceInfo.purchaseYear.message}</p>}
                      </div>
                    )}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Status</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {warrantyOptions.map((warranty) => (
                      <Controller
                        key={warranty.value}
                        name="deviceInfo.warrantyStatus"
                        control={control}
                        render={({ field }) => (
                          <div
                            onClick={() => field.onChange(warranty.value)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${field.value === warranty.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon icon={warranty.icon} className={`text-base ${warranty.color}`} />
                              <h3 className="text-sm font-medium text-gray-900">{warranty.label}</h3>
                            </div>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                  {errors.deviceInfo?.warrantyStatus && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.deviceInfo.warrantyStatus.message}</p>}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Icon icon="mdi:currency-usd" className="text-orange-500" />
                  Budget Range (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Controller
                    name="budget.min"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <input
                          {...field}
                          type="number"
                          placeholder="Minimum"
                          className={`w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.budget?.min ? 'border-red-300' : 'border-gray-200'}`}
                        />
                        <Icon icon="mdi:currency-usd" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        {errors.budget?.min && <p className="mt-1 text-xs text-red-600">{errors.budget.min.message}</p>}
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
                          className={`w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.budget?.max ? 'border-red-300' : 'border-gray-200'}`}
                        />
                        <Icon icon="mdi:currency-usd" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        {errors.budget?.max && <p className="mt-1 text-xs text-red-600">{errors.budget.max.message}</p>}
                      </div>
                    )}
                  />
                  <Controller
                    name="budget.currency"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-200"
                      >
                        <option value="PKR">PKR</option>
                        <option value="TRY">TRY</option> {/* Added Turkish Lira */}
                        <option value="USD">USD</option>
                        {/* <option value="EUR">EUR</option> */}
                      </select>
                    )}
                  />

                </div>
                {(watchedBudgetMin && watchedBudgetMax && parseInt(watchedBudgetMin) > parseInt(watchedBudgetMax)) && (
                  <p className="mt-2 text-xs text-red-600">Minimum budget cannot be greater than maximum budget</p>
                )}
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Device Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                  <Icon icon="mdi:cloud-upload" className="text-3xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload clear photos of your device and the damage</p>
                  <p className="text-xs text-gray-500 mb-3">Support: JPG, PNG, HEIC (Max 5MB each)</p>
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition-colors text-sm"
                  >
                    <Icon icon="mdi:upload" />
                    Choose Files
                  </label>
                  {deviceImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {deviceImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Device ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = deviceImages.filter((_, i) => i !== index);
                              setDeviceImages(newFiles);
                              setValue('images', newFiles);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.images && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.images.message}</p>}
              </div> */}
            </div>

            {/* Location & Preferences Section */}
            <div className="p-6 md:p-8 border-t border-gray-200 space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon icon="mdi:map-marker" className="text-xl text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">Location & Preferences</h2>
              </div>

              {/* Current Location Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-900 flex items-center gap-2">
                    <Icon icon="mdi:crosshairs-gps" className="text-blue-600" />
                    Auto-detect Location
                  </h3>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:map-marker" className="text-sm" />
                        Get Current Location
                      </>
                    )}
                  </button>
                </div>

                {locationError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <Icon icon="mdi:alert-circle" />
                    {locationError}
                  </p>
                )}

                {coordinates && (
                  <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <Icon icon="mdi:check-circle" />
                    Location detected: {coordinates?.latitude?.toFixed(6)}, {coordinates?.longitude?.toFixed(6)}
                  </div>
                )}
              </div>

              {/* Service Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Preference</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {servicePreferences.map((pref) => (
                    <Controller
                      key={pref.value}
                      name="servicePreference"
                      control={control}
                      render={({ field }) => (
                        <div
                          onClick={() => field.onChange(pref.value)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${field.value === pref.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                        >
                          <div className="flex items-start gap-2">
                            <Icon icon={pref.icon} className={`text-base mt-0.5 ${field.value === pref.value ? 'text-orange-500' : 'text-gray-400'}`} />
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{pref.label}</h3>
                              <p className="text-xs text-gray-600 mt-1">{pref.desc}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  ))}
                </div>
                {errors.servicePreference && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.servicePreference.message}</p>}
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Controller
                    name="preferredTime"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                        <div className="relative">
                          <input
                            {...field}
                            type="datetime-local"
                            min={getMinDateTime()}
                            className={`w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.preferredTime ? 'border-red-300' : 'border-gray-200'}`}
                          />
                          <Icon icon="mdi:clock" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                        {errors.preferredTime && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><Icon icon="mdi:alert-circle" />{errors.preferredTime.message}</p>}
                      </div>
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="location.address"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <div className="relative">
                          <input
                            {...field}
                            type="text"
                            placeholder="123 Main Street, Apartment 4B"
                            className={`w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.location?.address ? 'border-red-300' : 'border-gray-200'}`}
                            onBlur={() => {
                              field.onBlur();
                              // Optionally geocode the address when user finishes typing
                              if (watchedAddress && watchedCity) {
                                getLocationFromAddress(`${watchedAddress}, ${watchedCity}`);
                              }
                            }}
                          />
                          <Icon icon="mdi:road" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                        {errors.location?.address && <p className="mt-1 text-xs text-red-600">{errors.location.address.message}</p>}
                      </div>
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="location.city"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <div className="relative">
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., Karachi"
                            className={`w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.location?.city ? 'border-red-300' : 'border-gray-200'}`}
                          />
                          <Icon icon="mdi:city" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                        {errors.location?.city && <p className="mt-1 text-xs text-red-600">{errors.location.city.message}</p>}
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Additional Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Controller
                    name="location.district"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District (Optional)</label>
                        <div className="relative">
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., Clifton"
                            className="w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-200"
                          />
                          <Icon icon="mdi:map" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                      </div>
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="location.zipCode"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code (Optional)</label>
                        <div className="relative">
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., 75600"
                            className="w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-200"
                          />
                          <Icon icon="mdi:mailbox" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                      </div>
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="maxOffers"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Offers</label>
                        <div className="relative">
                          <input
                            {...field}
                            type="number"
                            min="1"
                            max="20"
                            placeholder="10"
                            className="w-full p-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-200"
                          />
                          <Icon icon="mdi:numeric" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">1-20 offers</p>
                      </div>
                    )}
                  />
                </div>

                {/* Manual Coordinates Input */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates (Optional)</label>
                  <div className="grid grid-cols-1 gap-2">
                    <Controller
                      name="location.coordinates.latitude"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          className="w-full p-2 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-orange-500 border-gray-200"
                        />
                      )}
                    />
                    <Controller
                      name="location.coordinates.longitude"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step="any"
                          placeholder="Longitude"
                          className="w-full p-2 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-orange-500 border-gray-200"
                        />
                      )}
                    />
                  </div>
                </div> */}
              </div>

              {/* Additional Options */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Icon icon="mdi:cog" className="text-gray-600" />
                  Additional Options
                </h3>
                <Controller
                  name="autoSelectBest"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Auto-select best offer</span>
                        <p className="text-xs text-gray-600">Automatically accept the best offer when available</p>
                      </div>
                    </label>
                  )}
                />
              </div>

              {/* Job Summary */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <h3 className="text-base font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Icon icon="mdi:clipboard-check" className="text-orange-500" />
                  Job Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div><strong>Title:</strong> {watch('title') || 'Not specified'}</div>
                  <div><strong>Category:</strong> {categories.find(c => c._id === watch('categoryId'))?.name || 'Not selected'}</div>
                  <div><strong>Device:</strong> {watch('deviceInfo.brand')} {watch('deviceInfo.model') || 'Not specified'}</div>
                  <div><strong>Urgency:</strong> {urgencyLevels.find(u => u.value === watch('urgency'))?.label || 'Medium'}</div>
                  <div><strong>Service:</strong> {servicePreferences.find(s => s.value === watch('servicePreference'))?.label || 'Pickup & Delivery'}</div>
                  <div><strong>Images:</strong> {deviceImages.length} uploaded</div>
                  {coordinates && (
                    <div className="md:col-span-3">
                      <strong>Location:</strong> {coordinates?.latitude?.toFixed(4)}, {coordinates?.longitude?.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-6 md:p-8 border-t border-gray-200 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <Icon icon="mdi:help-circle" className="text-base" />
            <span>Need help?</span>
            <a href="#" className="text-orange-500 hover:text-orange-600 font-medium">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}