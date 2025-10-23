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

// Validation schema - Only image file validation (image itself is optional for update)
const bannerSchema = yup.object().shape({
  image: yup
    .mixed()
    .nullable()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value || value.length === 0) return true; // Optional on edit
      const file = value[0];
      return file && file.type.startsWith('image/');
    })
    .test('fileSize', 'Image size must be less than 2MB', (value) => {
      if (!value || value.length === 0) return true; // Optional on edit
      const file = value[0];
      return file && file.size <= 2 * 1024 * 1024; // 2MB
    }),
});

function EditBannerPage() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const bannerId = params?.id;
  const { token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(bannerSchema),
    defaultValues: {
      ctaText: '',
      ctaLink: '',
      startDate: '',
      endDate: '',
      image: null,
    },
  });

  // Fetch banner data on mount
  useEffect(() => {
    if (bannerId) {
      fetchBannerData();
    }
  }, [bannerId]);

  const fetchBannerData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/banners/${bannerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const bannerData = response.data.data;
      
      // Set form values
      setValue('ctaText', bannerData.ctaText || '');
      setValue('ctaLink', bannerData.ctaLink || '');
      
      // Format dates for input[type="date"]
      if (bannerData.startDate) {
        const startDate = new Date(bannerData.startDate).toISOString().split('T')[0];
        setValue('startDate', startDate);
      }
      if (bannerData.endDate) {
        const endDate = new Date(bannerData.endDate).toISOString().split('T')[0];
        setValue('endDate', endDate);
      }

      // Set existing image
      if (bannerData.image) {
        setExistingImage(bannerData.image);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching banner:', error);
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Failed to load banner data';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
      
      // Redirect back if banner not found
      setTimeout(() => {
        router.push('/admin/banners');
      }, 2000);
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
      setValue('image', null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');
      setUploadProgress(0);

      // Create FormData for file upload
      const formData = new FormData();
      
      // Only append fields if they have values
      if (data.ctaText) formData.append('ctaText', data.ctaText);
      if (data.ctaLink) formData.append('ctaLink', data.ctaLink);
      if (data.startDate) formData.append('startDate', data.startDate);
      if (data.endDate) formData.append('endDate', data.endDate);

      // Add new image if selected
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }

      // Make API call with progress tracking
      const response = await axiosInstance.put(`/admin/banners/${bannerId}`, formData, {
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
      toast.success(response.data.message || 'Banner updated successfully!');
      setSubmitSuccess('Banner updated successfully!');
      setUploadProgress(0);

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(''), 5000);

      // Navigate back to banner list after 2 seconds
      setTimeout(() => {
        router.push('/admin/banners');
      }, 2000);
    } catch (error) {
      console.error('Error updating banner:', error);
      setUploadProgress(0);

      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update banner. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    router.push('/admin/banners');
  };

  const removeNewImage = () => {
    setImagePreview(null);
    setValue('image', null);
    const fileInput = document.getElementById('image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading banner data...</p>
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
                title="Back to banners"
                aria-label="Back to banners"
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Banner</h1>
                <p className="text-gray-600 mt-1">Update your promotional banner</p>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-6">
              {/* Banner Image Upload */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a new banner image (optional). Supported formats: JPG, PNG, GIF, WebP. Max size: 2MB.
                  Leave empty to keep the existing image.
                </p>

                {/* File Input */}
                <div className="space-y-4">
                  <input
                    type="file"
                    id="image"
                    {...register('image')}
                    onChange={(e) => {
                      register('image').onChange(e);
                      handleImageChange(e);
                    }}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    aria-describedby="image-description"
                  />
                  <p id="image-description" className="sr-only">
                    Upload a banner image. Supported formats: JPG, PNG, GIF, WebP. Max size: 2MB.
                  </p>

                  {errors.image && (
                    <p className="text-sm text-red-600" role="alert">
                      {errors.image.message}
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

                  {/* New Image Preview */}
                  {imagePreview && (
                    <div className="relative inline-block w-full">
                      <div className="border-2 border-dashed border-primary-300 rounded-lg p-4">
                        <p className="text-sm text-primary-600 font-medium mb-2">New Image:</p>
                        <img
                          src={imagePreview}
                          alt="New banner preview"
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeNewImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                        title="Remove new image"
                        aria-label="Remove new image"
                      >
                        <Icon icon="mdi:close" className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Existing Image */}
                  {!imagePreview && existingImage && (
                    <div className="border-2 border-gray-300 rounded-lg p-4">
                      <p className="text-sm text-gray-600 font-medium mb-2">Current Image:</p>
                      <img
                        src={existingImage}
                        alt="Current banner"
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Upload Area when no image */}
                  {!imagePreview && !existingImage && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-400 transition-colors">
                      <Icon icon="mdi:cloud-upload" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium mb-2">
                        Click "Choose File" above to upload your banner
                      </p>
                      <p className="text-gray-500 text-sm">
                        Recommended size: 1920x600px | Max file size: 2MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Text - COMMENTED */}
              {/* <div>
                <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 mb-2">
                  Call-to-Action Text
                </label>
                <input
                  id="ctaText"
                  type="text"
                  {...register('ctaText')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.ctaText ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Shop Now, Learn More, Get Started"
                  aria-invalid={errors.ctaText ? 'true' : 'false'}
                />
                {errors.ctaText && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.ctaText.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  This text will appear on the banner button
                </p>
              </div> */}

              {/* CTA Link - COMMENTED */}
              {/* <div>
                <label htmlFor="ctaLink" className="block text-sm font-medium text-gray-700 mb-2">
                  Call-to-Action Link
                </label>
                <input
                  id="ctaLink"
                  type="url"
                  {...register('ctaLink')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.ctaLink ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/your-page"
                  aria-invalid={errors.ctaLink ? 'true' : 'false'}
                />
                {errors.ctaLink && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.ctaLink.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Where users will be redirected when they click the banner
                </p>
              </div> */}

              {/* Date Range - COMMENTED */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-invalid={errors.startDate ? 'true' : 'false'}
                    />
                    <Icon 
                      icon="mdi:calendar" 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
                    />
                  </div>
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.startDate.message}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    When the banner should start showing
                  </p>
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-invalid={errors.endDate ? 'true' : 'false'}
                    />
                    <Icon 
                      icon="mdi:calendar" 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
                    />
                  </div>
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.endDate.message}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    When the banner should stop showing
                  </p>
                </div>
              </div> */}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Icon icon="mdi:information" className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Update Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Upload a new image only if you want to replace the existing one</li>
                      <li>All fields are optional - only update what you need to change</li>
                      <li>The existing image will be kept if you don't upload a new one</li>
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
                  aria-label="Cancel banner update"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadProgress > 0}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Update banner"
                >
                  {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Update Banner'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBannerPage