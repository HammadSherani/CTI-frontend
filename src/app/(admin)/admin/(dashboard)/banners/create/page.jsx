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

const bannerSchema = yup.object().shape({
  image: yup
    .mixed()
    .required('Banner image is required')
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value || value.length === 0) return false;
      const file = value[0];
      return file && file.type.startsWith('image/');
    })
    .test('fileSize', 'Image size must be less than 2MB', (value) => {
      if (!value || value.length === 0) return false;
      const file = value[0];
      return file && file.size <= 2 * 1024 * 1024;
    }),

  label: yup
    .string()
    .trim()
    .optional(),

  title: yup
    .string()
    .trim()
    .required('Title is required'),

  description: yup
    .string()
    .trim()
    .optional(),
});


function CreateBanner() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
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
    resolver: yupResolver(bannerSchema),
    defaultValues: {
      ctaText: '',
      ctaLink: '',
      startDate: '',
      endDate: '',
      image: null,
      label: '',
      title: '',
      description: '',
    },
  });

  const watchedImage = watch('image');

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
      // Reset messages and progress
      setSubmitError('');
      setSubmitSuccess('');
      setUploadProgress(0);

      // Create FormData
      const formData = new FormData();

      // Append text fields (title is required; others optional)
      formData.append('title', data.title || '');  // Always append (required)
      formData.append('label', data.label || '');  // Optional
      formData.append('description', data.description || '');  // Optional

      // Append optional CTA/date fields
      ['ctaText', 'ctaLink', 'startDate', 'endDate'].forEach((field) => {
        if (data[field]) formData.append(field, data[field]);
      });

      // Append image (required)
      if (data.image?.length > 0) {
        formData.append('image', data.image[0]);
      } else {
        throw new Error('Please select an image to upload.');
      }

      // API call with progress
      const response = await axiosInstance.post('/admin/banners', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      // Success
      const successMessage = response.data?.message || 'Banner created successfully!';
      setSubmitSuccess(successMessage);
      toast.success(successMessage);

      // Reset form and preview
      reset();
      setImagePreview(null);
      setUploadProgress(0);

      // Clear success message after 5s
      setTimeout(() => setSubmitSuccess(''), 5000);

      // Navigate to banner list after 2s
      setTimeout(() => router.push('/admin/banners'), 2000);
    } catch (error) {
      console.error('Error creating banner:', error);
      setUploadProgress(0);

      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create banner. Please try again.';
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
    router.push('/admin/banners');
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('image', null);
    const fileInput = document.getElementById('image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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
                <h1 className="text-3xl font-bold text-gray-900">Create New Banner</h1>
                <p className="text-gray-600 mt-1">Add a new promotional banner for your website</p>
              </div>
            </div>
          </div>
        </div>

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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4 space-y-6">
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image *
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a banner image (required). Supported formats: JPG, PNG, GIF, WebP. Max size: 2MB.
                  Recommended dimensions: 1920x600px for best results.
                </p>

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

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                        aria-label={`Upload progress: ${uploadProgress}%`}
                      ></div>
                    </div>
                  )}

                  {imagePreview && (
                    <div className="relative inline-block w-full">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <img
                          src={imagePreview}
                          alt="Banner preview"
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                        title="Remove image"
                        aria-label="Remove uploaded image"
                      >
                        <Icon icon="mdi:close" className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {!imagePreview && (
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



              {/* <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Cancel banner creation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadProgress > 0 || !isValid}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Create banner"
                >
                  {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Create Banner'}
                </button>
              </div> */}
            </div>

            <div className="space-y-4">

              {/* Label */}
              <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  id="label"
                  {...register('label')}
                  placeholder="Optional label (e.g., New Arrival)"
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-600"
                />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title')}
                  placeholder="Banner title"
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-600"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className='mb-4'>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  placeholder="Optional banner description"
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  rows={3}
                ></textarea>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cancel banner creation"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadProgress > 0 || !isValid}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Create banner"
              >
                {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Create Banner'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBanner;