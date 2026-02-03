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

// Validation schema (matches the create form)
const partSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must not exceed 200 characters'),
  category: yup
    .string()
    .required('Category is required'),
  description: yup
    .string()
    .nullable(),
  images: yup
    .mixed()
    .test('fileCount', 'You can upload maximum 10 images', (value) => {
      if (!value) return true;
      return value.length <= 10;
    })
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return true;
      return Array.from(value).every(file => file.type.startsWith('image/'));
    })
    .test('fileSize', 'Each image must be less than 5MB', (value) => {
      if (!value) return true;
      return Array.from(value).every(file => file.size <= 5 * 1024 * 1024);
    }),
  videos: yup
    .mixed()
    .test('fileCount', 'You can upload maximum 1 video', (value) => {
      if (!value) return true;
      return value.length <= 1;
    })
    .test('fileType', 'Only video files are allowed', (value) => {
      if (!value) return true;
      return Array.from(value).every(file => file.type.startsWith('video/'));
    })
    .test('fileSize', 'Each video must be less than 50MB', (value) => {
      if (!value) return true;
      return Array.from(value).every(file => file.size <= 50 * 1024 * 1024);
    })
    .nullable(),
  isActive: yup.boolean().nullable(),
  isFeatured: yup.boolean().nullable(),
});

function AcademyContentCreate() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
    const [videoPreviews, setVideoPreviews] = useState([]);
  
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(partSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      images: null,
      videos: null,
    },
  });



  // Fetch brands
  useEffect(() => {
    fetchCategories();
  }, []);



  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axiosInstance.get('/admin/academic-category', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };



  // Handle image selection and preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      setImagePreviews([]);
      setValue('images', null);
      return;
    }

    if (files.length > 10) {
      toast.error('You can upload maximum 10 images');
      return;
    }

    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error('Please select only image files');
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    // Create previews using object URLs and store file refs in form
    const previews = files.map((file, index) => ({ id: Date.now() + index, url: URL.createObjectURL(file), file }));
    setImagePreviews(previews);
    setValue('images', files, { shouldValidate: true });
  };

  const removeImage = (id) => {
    setImagePreviews(prev => {
      const toKeep = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed && removed.url) URL.revokeObjectURL(removed.url);
      // update form files
      if (toKeep.length === 0) {
        setValue('images', null, { shouldValidate: true });
        const fileInput = document.getElementById('images');
        if (fileInput) fileInput.value = '';
      } else {
        setValue('images', toKeep.map(p => p.file), { shouldValidate: true });
      }
      return toKeep;
    });
  };

  // Video handlers
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setVideoPreviews([]);
      setValue('videos', null);
      return;
    }

    if (files.length > 1) {
      toast.error('You can upload maximum 1 video');
      return;
    }

    const invalid = files.filter(f => !f.type.startsWith('video/'));
    if (invalid.length > 0) {
      toast.error('Please select only video files');
      return;
    }

    const oversized = files.filter(f => f.size > 50 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error('Each video must be less than 50MB');
      return;
    }

    const previews = files.map((file, index) => ({ id: Date.now() + index, url: URL.createObjectURL(file), file }));
    setVideoPreviews(previews);
    setValue('videos', files, { shouldValidate: true });
  };

  const removeVideo = (id) => {
    setVideoPreviews(prev => {
      const toKeep = prev.filter(v => v.id !== id);
      const removed = prev.find(v => v.id === id);
      if (removed && removed.url) URL.revokeObjectURL(removed.url);
      if (toKeep.length === 0) {
        setValue('videos', null, { shouldValidate: true });
        const fileInput = document.getElementById('videos');
        if (fileInput) fileInput.value = '';
      } else {
        setValue('videos', toKeep.map(p => p.file), { shouldValidate: true });
      }
      return toKeep;
    });
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');
      setUploadProgress(0);

      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all fields
      formData.append('title', data.title || '');
      formData.append('categoryId', data.category || '');
      formData.append('description', data.description || '');

      // Add images if provided (multiple)
      imagePreviews.forEach(preview => {
        formData.append('image', preview.file);
      });

      // Add videos if provided (single)
      videoPreviews.forEach(preview => {
        formData.append('video', preview.file);
      });

      const response = await axiosInstance.post('/admin/academic-content/create', formData, {
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
      toast.success(response.data.message || 'Course created successfully!');
      setSubmitSuccess('Course created successfully!');

      // Reset form and previews (revoke object URLs)
      reset();
      imagePreviews.forEach(p => p.url && URL.revokeObjectURL(p.url));
      videoPreviews.forEach(p => p.url && URL.revokeObjectURL(p.url));
      setImagePreviews([]);
      setVideoPreviews([]);
      setUploadProgress(0);

      // Navigate back to academy list after 2 seconds
      setTimeout(() => {
        router.push('/admin/academy/ace-management');
      }, 2000);
    } catch (error) {
      console.error('Error creating part:', error);
      setUploadProgress(0);

      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create part. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    reset();
    imagePreviews.forEach(p => p.url && URL.revokeObjectURL(p.url));
    videoPreviews.forEach(p => p.url && URL.revokeObjectURL(p.url));
    setImagePreviews([]);
    setVideoPreviews([]);
    setSubmitError('');
    setSubmitSuccess('');
    setUploadProgress(0);
    router.push('/admin/academy/ace-management');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Back to parts"
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-gray-600 mt-1">Add a new part to your inventory</p>
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
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:information" className="w-6 h-6 text-primary-600" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1  gap-6">
                {/* Part Name */}
                <div className="">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    {...register('title')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Front Brake Pad Set, Engine Oil Filter"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}    
                </div>

              
               
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    {...register('category')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loadingCategories}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>{category.title}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

  <div className="space-y-6">
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Detailed description of the part, its features, and specifications..."
                  />
                </div>

              </div>

              </div>
            </div>


            {/* Images Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:image-multiple" className="w-6 h-6 text-primary-600" />
                Part Images
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Upload images of the part. You can upload up to 10 images. Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB per image.
              </p>

              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mb-4"
              />

              {errors.images && (
                <p className="text-sm text-red-600 mb-4">{errors.images.message}</p>
              )}

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview) => (
                    <div key={preview.id} className="relative group">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 aspect-square">
                        <img
                          src={preview.url}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(preview.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <Icon icon="mdi:close" className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Icon icon="mdi:image-multiple-outline" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">
                    No images uploaded yet
                  </p>
                  <p className="text-gray-500 text-sm">
                    Click "Choose Files" above to upload images
                  </p>
                </div>
              )}
            </div>

          


            {/* Videos Upload */}
                 {/* Videos Upload */}
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Icon icon="mdi:video" className="w-6 h-6 text-primary-600" />
                          Course Video
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                          Upload a video for the course. Supported formats: MP4, AVI, MOV. Max size: 50MB.
                        </p>
                        
                        <input
                          type="file"
                          id="videos"
                          accept="video/*"
                          onChange={handleVideoChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mb-4"
                        />
                        
                        {errors.videos && (
                          <p className="text-sm text-red-600 mb-4">{errors.videos.message}</p>
                        )}
          
                        {/* Upload Progress */}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
          
                        {/* Video Previews */}
                        {videoPreviews.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {videoPreviews.map((preview) => (
                              <div key={preview.id} className="relative group">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 aspect-video">
                                  <video
                                    src={preview.url}
                                    className="w-full h-full object-cover rounded-lg"
                                    controls
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeVideo(preview.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                                  title="Remove video"
                                >
                                  <Icon icon="mdi:close" className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <Icon icon="mdi:video" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium mb-1">No videos uploaded yet</p>
                            <p className="text-gray-500 text-sm">Click "Choose File" above to upload a video</p>
                          </div>
                        )}
                      </div>

        

            {/* Submit Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadProgress > 0}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Create Academy Content'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AcademyContentCreate;