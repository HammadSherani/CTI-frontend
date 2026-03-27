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

// Validation schema
const categorySchema = yup.object().shape({
  name: yup
    .string()
    .required('Category name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  icon: yup
    .mixed()
    .nullable()
    .test('fileType', 'Only image files are allowed', (value) => {
      // If no value or null or undefined, it's valid (icon is optional)
      if (!value) return true;
      // If it's a FileList and empty, it's valid
      if (value.length === 0) return true;
      // Check if first file is an image
      const file = value[0];
      return file && file.type && file.type.startsWith('image/');
    })
    .test('fileSize', 'Image size must be less than 2MB', (value) => {
      // If no value or null or undefined, it's valid (icon is optional)
      if (!value) return true;
      // If it's a FileList and empty, it's valid
      if (value.length === 0) return true;
      // Check file size
      const file = value[0];
      return file && file.size <= 2 * 1024 * 1024; // 2MB
    }),
  isActive: yup.boolean(),
  isFeatured: yup.boolean(),
});

function EditAcademyCategory() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [iconPreview, setIconPreview] = useState(null);
  const [existingIcon, setExistingIcon] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [iconChanged, setIconChanged] = useState(false);
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id;
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
    mode: 'onChange', // Validate on change to update isValid properly
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

  // Fetch category data
  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/academic-category/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const category = response.data.data;
      
      // Populate form with existing data
      setValue('name', category.title);
      
      // Set existing icon preview
      if (category.icon) {
        setExistingIcon(category.icon);
        setIconPreview(category.icon);
      }
      
    } catch (error) {
      console.error('Error fetching category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load category';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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

      setIconChanged(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setIconPreview(existingIcon);
      setValue('icon', null);
      setIconChanged(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');
      setUploadProgress(0);

      // Create FormData for file upload
      const formData = new FormData();
      
      // Append fields
      formData.append('title', data.name);

      // Add new icon only if changed and file exists
      if (iconChanged && data.icon && data.icon.length > 0) {
        formData.append('icon', data.icon[0]);
      }
      // If icon was removed (iconChanged but no new file), don't send icon field
      // Backend will keep the old icon if no icon field is sent

      // Make API call with progress tracking
      const response = await axiosInstance.put(`/admin/academic-category/${categoryId}`, formData, {
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
      toast.success(response.data.message || 'Category updated successfully!');
      setSubmitSuccess('Category updated successfully!');
      setUploadProgress(0);
      setIconChanged(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(''), 5000);

      // Navigate back to category list after 2 seconds
      setTimeout(() => {
        router.push('/admin/academy/academy-categories');
      }, 2000);
    } catch (error) {
      console.error('Error updating category:', error);
      setUploadProgress(0);

      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update category. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    router.push('/admin/academy/academy-categories');
  };

  const removeIcon = () => {
    setIconPreview(null);
    setExistingIcon(null);
    setIconChanged(true);
    setValue('icon', null);
    const fileInput = document.getElementById('icon');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading category...</p>
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
                title="Back to categories"
                aria-label="Back to categories"
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Parts Category</h1>
                <p className="text-gray-600 mt-1">Update category information and settings</p>
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
                  Upload a new icon to replace the existing one. Supported formats: JPG, PNG, GIF, WebP. Max size: 2MB.
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
                      {iconChanged && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                          New
                        </div>
                      )}
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

         
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Icon icon="mdi:information" className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Update Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Changes will be applied immediately after saving</li>
                      <li>If you upload a new icon, the old one will be replaced</li>
                      <li>Deactivating a category won't delete associated parts</li>
                      <li>Featured status can be toggled without affecting functionality</li>
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
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadProgress > 0 || !isValid}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Update category"
                >
                  {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Update Category'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAcademyCategory;