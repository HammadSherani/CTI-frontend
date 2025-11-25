"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

// Validation schema
const categorySchema = yup.object().shape({
  name: yup
    .string()
    .required('Category name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  icon: yup
    .mixed()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value || value.length === 0) return true; // Icon is optional
      const file = value[0];
      return file && file.type.startsWith('image/');
    })
    .test('fileSize', 'Image size must be less than 2MB', (value) => {
      if (!value || value.length === 0) return true; // Icon is optional
      const file = value[0];
      return file && file.size <= 2 * 1024 * 1024; // 2MB
    }),
  isActive: yup.boolean(),
  isFeatured: yup.boolean(),
});

function CreatePartsCategory() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [iconPreview, setIconPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: null,
      isActive: true,
      isFeatured: false,
    },
  });

  const watchedIcon = watch('icon');
  const watchedIsActive = watch('isActive');
  const watchedIsFeatured = watch('isFeatured');

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
      
      // Append required fields
      formData.append('name', data.name);
      formData.append('isActive', data.isActive);
      formData.append('isFeatured', data.isFeatured);

      // Add icon if provided
      if (data.icon && data.icon.length > 0) {
        formData.append('icon', data.icon[0]);
      }

      // Make API call with progress tracking
      const response = await axiosInstance.post('/admin/parts/parts-categories', formData, {
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
      toast.success(response.data.message || 'Category created successfully!');
      setSubmitSuccess('Category created successfully!');

      // Reset form and preview
      reset();
      setIconPreview(null);
      setUploadProgress(0);

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(''), 5000);

      // Navigate back to category list after 2 seconds
      setTimeout(() => {
        router.push('/admin/parts/parts-categories');
      }, 2000);
    } catch (error) {
      console.error('Error creating category:', error);
      setUploadProgress(0);

      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create category. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    reset();
    setIconPreview(null);
    setSubmitError('');
    setSubmitSuccess('');
    setUploadProgress(0);
    router.push('/admin/parts/parts-categories');
  };

  const removeIcon = () => {
    setIconPreview(null);
    setValue('icon', null);
    const fileInput = document.getElementById('icon');
    if (fileInput) {
      fileInput.value = '';
    }
  };

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
                title="Back to categories"
                aria-label="Back to categories"
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Parts Category</h1>
                <p className="text-gray-600 mt-1">Add a new category for organizing your parts inventory</p>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-6">
              {/* Category Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Engine Parts, Brake Systems, Electrical Components"
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.name.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Enter a clear and descriptive name for the category
                </p>
              </div>

              {/* Category Icon Upload */}
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Icon (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload an icon for the category. Supported formats: JPG, PNG, GIF, WebP. Max size: 2MB.
                  Recommended dimensions: 256x256px (square).
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
                    Upload a category icon. Supported formats: JPG, PNG, GIF, WebP. Max size: 2MB.
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

                  {/* Icon Preview */}
                  {iconPreview && (
                    <div className="relative inline-block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <img
                          src={iconPreview}
                          alt="Icon preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeIcon}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                        title="Remove icon"
                        aria-label="Remove uploaded icon"
                      >
                        <Icon icon="mdi:close" className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload Area when no icon */}
                  {!iconPreview && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                      <Icon icon="mdi:image-outline" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium mb-1">
                        Click "Choose File" above to upload an icon
                      </p>
                      <p className="text-gray-500 text-sm">
                        Recommended size: 256x256px | Max file size: 2MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Toggles */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium text-gray-900">Category Settings</h3>
                
                {/* Active Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Active Status
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Enable this category to be visible and usable in the system
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setValue('isActive', !watchedIsActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        watchedIsActive ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                      role="switch"
                      aria-checked={watchedIsActive}
                      aria-labelledby="isActive"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          watchedIsActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {watchedIsActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Featured Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label htmlFor="isFeatured" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Featured Category
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Featured categories are highlighted and appear prominently in the interface
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setValue('isFeatured', !watchedIsFeatured)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                        watchedIsFeatured ? 'bg-yellow-500' : 'bg-gray-200'
                      }`}
                      role="switch"
                      aria-checked={watchedIsFeatured}
                      aria-labelledby="isFeatured"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          watchedIsFeatured ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-3 text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Icon 
                        icon={watchedIsFeatured ? "mdi:star" : "mdi:star-outline"} 
                        className={watchedIsFeatured ? "text-yellow-500" : "text-gray-400"}
                      />
                      {watchedIsFeatured ? 'Featured' : 'Regular'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Icon icon="mdi:information" className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Category Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Choose clear, descriptive names that make it easy to find parts</li>
                      <li>Icons help users quickly identify categories at a glance</li>
                      <li>Active categories appear in the parts management system</li>
                      <li>Featured categories are highlighted in the user interface</li>
                      <li>You can edit these settings anytime from the categories list</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Cancel category creation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadProgress > 0 || !isValid}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Create category"
                >
                  {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Create Category'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePartsCategory;