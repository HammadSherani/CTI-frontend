"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const modelSchema = yup.object().shape({
  name: yup
    .string()
    .required('Model name is required')
    .min(2, 'Model name must be at least 2 characters')
    .max(50, 'Model name must be less than 50 characters'),
  brandId: yup
    .string()
    .required('Brand is required'),
  colors: yup
    .string()
    .required('Colors are required')
    .test('colors-length', 'At least one color is required', (value) => {
      if (!value) return false;
      return value.split(',').filter(color => color.trim().length > 0).length > 0;
    }),
  icon: yup
    .mixed()
    .nullable()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value || value.length === 0) return true; // Optional
      const file = value[0];
      return file && file.type.startsWith('image/');
    })
    .test('fileSize', 'Image size must be less than 2MB', (value) => {
      if (!value || value.length === 0) return true; // Optional
      const file = value[0];
      return file && file.size <= 2 * 1024 * 1024; // 2MB
    }),
});

function CreateModel() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(modelSchema),
    defaultValues: {
      name: '',
      brandId: '',
      colors: '',
      icon: null,
    },
  });

  const watchedName = watch('name');
  const watchedBrandId = watch('brandId');
  const watchedColors = watch('colors');

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const response = await axiosInstance.get('/admin/brands?limit=100&status=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setBrands(response.data.data.brands || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoadingBrands(false);
    }
  };

  // Handle image selection and preview
  const handleImageChange = (e) => {
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
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
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
      formData.append('brandId', data.brandId);
      formData.append('colors', data.colors);
      formData.append('isActive', 'true');

      // Add image if selected
      if (data.icon && data.icon.length > 0) {
        formData.append('icon', data.icon[0]);
      }

      // Make API call with progress tracking
      const response = await axiosInstance.post('/admin/models', formData, {
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
      toast.success(response.data.message || 'Model created successfully!');
      setSubmitSuccess('Model created successfully!');

      // Reset form and preview
      reset();
      setImagePreview(null);
      setUploadProgress(0);

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(''), 5000);

      // Navigate back to model list after 2 seconds
      setTimeout(() => {
        router.push('/admin/models');
      }, 2000);
    } catch (error) {
      console.error('Error creating model:', error);
      setUploadProgress(0);

      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create model. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    reset();
    setImagePreview(null);
    setSubmitError('');
    setSubmitSuccess('');
    setUploadProgress(0);
    router.push('/admin/model');
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('icon', null); // Reset form field
    const fileInput = document.getElementById('icon');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Get selected brand info
  const selectedBrand = brands.find(brand => brand._id === watchedBrandId);

  // Parse colors for display
  const colorList = watchedColors ? watchedColors.split(',').map(color => color.trim()).filter(color => color.length > 0) : [];

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
                title="Back to models"
                aria-label="Back to models"
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Model</h1>
                <p className="text-gray-600 mt-1">Add a new device model with specifications</p>
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

        {/* Create Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name *
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter model name (e.g., iPhone 15 Pro, Galaxy S24)"
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Brand Selection */}
              <div>
                <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <select
                  id="brandId"
                  {...register('brandId')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.brandId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-invalid={errors.brandId ? 'true' : 'false'}
                  disabled={loadingBrands}
                >
                  <option value="">
                    {loadingBrands ? 'Loading brands...' : 'Select a brand'}
                  </option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brandId && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.brandId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-2">
                Available Colors *
              </label>
              <input
                id="colors"
                type="text"
                {...register('colors')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.colors ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter colors separated by commas (e.g., Black, White, Blue, Red)"
                aria-invalid={errors.colors ? 'true' : 'false'}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter multiple colors separated by commas. These will be the available color options for this model.
              </p>
              {errors.colors && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.colors.message}
                </p>
              )}
              
              {/* Color Preview */}
              {colorList.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {colorList.map((color, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Model Icon Upload */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                Model Icon
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Upload a model icon image (optional). Supported formats: JPG, PNG, GIF, WebP, SVG. Max size: 2MB.
              </p>

              {/* File Input */}
              <div className="space-y-4">
                <input
                  type="file"
                  id="icon"
                  {...register('icon')}
                  onChange={(e) => {
                    register('icon').onChange(e);
                    handleImageChange(e);
                  }}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  aria-describedby="icon-description"
                />
                <p id="icon-description" className="sr-only">
                  Upload a model icon image. Supported formats: JPG, PNG, GIF, WebP, SVG. Max size: 2MB.
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

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative inline-block">
                    <div className="border-2 border-dashed border-primary-300 rounded-lg p-4">
                      <img
                        src={imagePreview}
                        alt="Model icon preview"
                        className="max-w-xs max-h-32 object-contain mx-auto"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove image"
                      aria-label="Remove uploaded image"
                    >
                      <Icon icon="mdi:close" className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload Area when no image */}
                {!imagePreview && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Icon icon="mdi:cloud-upload" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      No image selected. Click "Choose File" above to upload a model icon.
                    </p>
                  </div>
                )}
              </div>
            </div>

         

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cancel model creation"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || uploadProgress > 0 || !isValid}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Create model"
              >
                {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Create Model'}
              </button>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}

export default CreateModel;