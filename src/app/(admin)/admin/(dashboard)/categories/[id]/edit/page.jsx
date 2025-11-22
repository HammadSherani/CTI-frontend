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
  description: yup
    .string()
    .max(500, 'Description must not exceed 500 characters'),
  parent: yup.string().nullable(),
  sortOrder: yup
    .number()
    .typeError('Sort order must be a number')
    .integer('Sort order must be an integer')
    .min(0, 'Sort order must be 0 or greater'),
  isFeatured: yup.boolean(),
  isActive: yup.boolean(),
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

function EditCategoryPage() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [parentCategories, setParentCategories] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id;
  const { token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parent: '',
      sortOrder: 0,
      isFeatured: false,
      isActive: true,
      image: null,
    },
  });

  // Fetch category data and parent categories on mount
  useEffect(() => {
    if (categoryId) {
      setCurrentCategoryId(categoryId);
      fetchParentCategories();
      fetchCategoryData();
    }
  }, [categoryId]);

  const fetchParentCategories = async () => {
    try {
      setLoadingParents(true);
      const response = await axiosInstance.get('/admin/categories?isActive=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Filter out current category and its children to prevent circular reference
      const allCategories = response.data.data || [];
      setParentCategories(allCategories);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      toast.error('Failed to load parent categories');
    } finally {
      setLoadingParents(false);
    }
  };

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const categoryData = response.data.data;
      
      // Set form values
      setValue('name', categoryData.name || '');
      setValue('description', categoryData.description || '');
      setValue('parent', categoryData.parent?._id || '');
      setValue('sortOrder', categoryData.sortOrder || 0);
      setValue('isFeatured', categoryData.isFeatured || false);
      setValue('isActive', categoryData.isActive !== undefined ? categoryData.isActive : true);

      // Set existing image
      if (categoryData.image) {
        setExistingImage(categoryData.image);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching category:', error);
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Failed to load category data';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
      
      // Redirect back if category not found
      setTimeout(() => {
        router.push('/admin/categories');
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
      
      // Add fields
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.parent) formData.append('parent', data.parent);
      formData.append('sortOrder', data.sortOrder || 0);
      formData.append('isFeatured', data.isFeatured);
      formData.append('isActive', data.isActive);

      // Add new image if selected
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }

      // Make API call with progress tracking
      const response = await axiosInstance.put(`/admin/categories/${categoryId}`, formData, {
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

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(''), 5000);

      // Navigate back to category list after 2 seconds
      setTimeout(() => {
        router.push('/admin/categories');
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
    router.push('/admin/categories');
  };

  const removeNewImage = () => {
    setImagePreview(null);
    setValue('image', null);
    const fileInput = document.getElementById('image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Filter out current category and its potential children from parent options
  const availableParentCategories = parentCategories.filter(cat => 
    cat._id !== currentCategoryId && cat.parent?._id !== currentCategoryId
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading category data...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
                <p className="text-gray-600 mt-1">Update your product category</p>
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
                  placeholder="e.g., Electronics, Clothing, Books"
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.name.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  The name of your category (slug will be auto-updated)
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Brief description of this category..."
                  aria-invalid={errors.description ? 'true' : 'false'}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.description.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Optional description to help users understand this category
                </p>
              </div>

             

              {/* Category Image Upload */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a new category image (optional). Supported formats: JPG, PNG, GIF, WebP. Max size: 2MB.
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
                    Upload a category image. Supported formats: JPG, PNG, GIF, WebP. Max size: 2MB.
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
                          alt="New category preview"
                          className="w-full max-h-64 object-contain rounded-lg"
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
                        alt="Current category"
                        className="w-full max-h-64 object-contain rounded-lg"
                      />
                    </div>
                  )}

                  {/* Upload Area when no image */}
                  {!imagePreview && !existingImage && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-400 transition-colors">
                      <Icon icon="mdi:image-plus" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium mb-2">
                        Click "Choose File" above to upload category image
                      </p>
                      <p className="text-gray-500 text-sm">
                        Recommended size: 400x400px | Max file size: 2MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                {/* Featured Checkbox */}
                <div className="flex items-center">
                  <input
                    id="isFeatured"
                    type="checkbox"
                    {...register('isFeatured')}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                    <span className="font-medium">Featured Category</span>
                    <p className="text-gray-500">Display this category prominently on the homepage</p>
                  </label>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    <span className="font-medium">Active</span>
                    <p className="text-gray-500">Make this category visible to customers</p>
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Icon icon="mdi:information" className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Update Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Upload a new image only if you want to replace the existing one</li>
                      <li>Changing the name will automatically update the slug</li>
                      <li>You cannot set this category as its own parent or child</li>
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
                  aria-label="Cancel category update"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadProgress > 0}
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

export default EditCategoryPage;