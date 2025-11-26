"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const serviceSchema = yup.object().shape({
  name: yup
    .string()
    .required('Service name is required')
    .min(2, 'Service name must be at least 2 characters')
    .max(100, 'Service name must be less than 100 characters'),
  partCategories: yup
    .array()
    .min(1, 'At least one category is required')
    .required('Categories are required'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  icon: yup
    .mixed()
    .nullable()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value || value.length === 0) return true;
      const file = value[0];
      return file && file.type.startsWith('image/');
    })
    .test('fileSize', 'Image size must be less than 2MB', (value) => {
      if (!value || value.length === 0) return true;
      const file = value[0];
      return file && file.size <= 2 * 1024 * 1024;
    }),
  image: yup
    .string()
    .url('Must be a valid URL')
    .nullable(),
  isActive: yup.boolean().default(true),
  isFeatured: yup.boolean().default(false),
});

function EditService() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [iconPreview, setIconPreview] = useState(null);
  const [existingIcon, setExistingIcon] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [partCategories, setPartCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingService, setLoadingService] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id;
  const { token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(serviceSchema),
    defaultValues: {
      name: '',
      partCategories: [],
      description: '',
      icon: null,
      image: '',
      isActive: true,
      isFeatured: false,
    },
  });

  const watchedName = watch('name');
  const watchedDescription = watch('description');

  // Fetch service data and categories on component mount
  useEffect(() => {
    fetchPartCategories();
    fetchServiceData();
  }, [serviceId]);

  const fetchPartCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axiosInstance.get('/admin/parts/parts-categories/get-categories?limit=100&status=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPartCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchServiceData = async () => {
    try {
      setLoadingService(true);
      const response = await axiosInstance.get(`/admin/services/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const service = response.data.data || response.data.service;

      // Set form values
      setValue('name', service.name);
      setValue('description', service.description || '');
      setValue('image', service.image || '');
      setValue('isActive', service.isActive);
      setValue('isFeatured', service.isFeatured);

      // Set selected categories
      const categoryIds = service.partCategories?.map(cat => cat._id || cat) || [];
      setSelectedCategories(categoryIds);
      setValue('partCategories', categoryIds);

      // Set existing icon
      if (service.icon) {
        setExistingIcon(service.icon);
      }

    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service data');
      router.push('/admin/services');
    } finally {
      setLoadingService(false);
    }
  };

  // Handle category selection
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      
      setValue('partCategories', newSelection, { shouldValidate: true });
      return newSelection;
    });
  };

  // Handle icon selection and preview
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setIconPreview(null);
      setValue('icon', null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');
      setUploadProgress(0);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('partCategories', JSON.stringify(data.partCategories));
      formData.append('description', data.description);
      formData.append('isActive', data.isActive);
      formData.append('isFeatured', data.isFeatured);

      // Add image URL if provided
    //   if (data.image) {
    //     formData.append('image', data.image);
    //   }

      // Add new icon if selected
      if (data.icon && data.icon.length > 0) {
        formData.append('icon', data.icon[0]);
      }

      // Make API call with progress tracking
      const response = await axiosInstance.put(`/admin/services/${serviceId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      // Handle successful request
      toast.success(response.data.message || 'Service updated successfully!');
      setSubmitSuccess('Service updated successfully!');

      setUploadProgress(0);

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(''), 5000);

      // Navigate back to service list after 2 seconds
      setTimeout(() => {
        router.push('/admin/services');
      }, 2000);
    } catch (error) {
      console.error('Error updating service:', error);
      setUploadProgress(0);

      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update service. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    router.push('/admin/services');
  };

  const removeIcon = () => {
    setIconPreview(null);
    setExistingIcon(null);
    setValue('icon', null);
    const fileInput = document.getElementById('icon');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (loadingService || loadingCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading service data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Back to services"
                aria-label="Back to services"
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
                <p className="text-gray-600 mt-1">Update service details and settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
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

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            
            {/* Service Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter service name (e.g., Screen Repair, Battery Replacement)"
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows="4"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter a detailed description of this service..."
                aria-invalid={errors.description ? 'true' : 'false'}
              />
              <p className="mt-1 text-sm text-gray-500">
                {watchedDescription?.length || 0}/500 characters
              </p>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Part Categories Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Part Categories * <span className="text-gray-500 text-xs">(Select at least one)</span>
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {partCategories.map((category) => (
                  <label
                    key={category._id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedCategories.includes(category._id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleCategoryToggle(category._id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="ml-3 flex items-center gap-2">
                      {category.icon && (
                        <img
                          src={category.icon}
                          alt={category.name}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {category.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              
              {selectedCategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Selected ({selectedCategories.length}):</span>
                  {selectedCategories.map((catId) => {
                    const category = partCategories.find(c => c._id === catId);
                    return category ? (
                      <span
                        key={catId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {category.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              
              {errors.partCategories && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.partCategories.message}
                </p>
              )}
            </div>

            {/* Service Icon Upload */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                Service Icon
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Upload a new icon to replace the existing one (optional). Supported formats: JPG, PNG, GIF, WebP, SVG. Max size: 2MB.
              </p>

              {/* File Input */}
              <div className="space-y-4">
                <input
                  type="file"
                  id="icon"
                  {...register('icon')}
                  onChange={(e) => {
                    register('icon').onChange(e);
                    handleIconChange(e);
                  }}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  aria-describedby="icon-description"
                />
                <p id="icon-description" className="sr-only">
                  Upload a service icon image. Supported formats: JPG, PNG, GIF, WebP, SVG. Max size: 2MB.
                </p>

                {errors.icon && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.icon.message}
                  </p>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                      aria-label={`Upload progress: ${uploadProgress}%`}
                    ></div>
                  </div>
                )}

                {/* Icon Preview - New or Existing */}
                {(iconPreview || existingIcon) && (
                  <div className="relative inline-block">
                    <div className="border-2 border-dashed border-primary-300 rounded-lg p-4">
                      <img
                        src={iconPreview || existingIcon}
                        alt="Service icon preview"
                        className="max-w-xs max-h-32 object-contain mx-auto"
                      />
                    </div>
                    {iconPreview && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-green-600 font-medium">New icon selected</span>
                      </div>
                    )}
                    {!iconPreview && existingIcon && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-gray-600">Current icon</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeIcon}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove icon"
                      aria-label="Remove icon"
                    >
                      <Icon icon="mdi:close" className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload Area when no icon */}
                {!iconPreview && !existingIcon && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Icon icon="mdi:cloud-upload" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      No icon available. Click "Choose File" above to upload a service icon.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Image URL (Optional) */}
            {/* <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                id="image"
                type="url"
                {...register('image')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.image ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/service-image.jpg"
                aria-invalid={errors.image ? 'true' : 'false'}
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional: Provide a URL to an external service image
              </p>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.image.message}
                </p>
              )}
            </div> */}

            {/* Status Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Is Active */}
              <div className="flex items-center p-4 border rounded-lg">
                <input
                  id="isActive"
                  type="checkbox"
                  {...register('isActive')}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Active Service</span>
                  <p className="text-xs text-gray-500">Service will be visible to users</p>
                </label>
              </div>

              {/* Is Featured */}
              <div className="flex items-center p-4 border rounded-lg">
                <input
                  id="isFeatured"
                  type="checkbox"
                  {...register('isFeatured')}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isFeatured" className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Featured Service</span>
                  <p className="text-xs text-gray-500">Show in featured section</p>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cancel service update"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || uploadProgress > 0 || !isValid || selectedCategories.length === 0}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Update service"
              >
                {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Update Service'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditService;