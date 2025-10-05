"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';

// Validation schema
const categorySchema = yup.object().shape({
  name: yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  nameTurkish: yup.string()
    .required('Turkish name is required')
    .min(2, 'Turkish name must be at least 2 characters')
    .max(50, 'Turkish name must be less than 50 characters'),
  description: yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
  descriptionTurkish: yup.string()
    .required('Turkish description is required')
    .min(10, 'Turkish description must be at least 10 characters')
    .max(200, 'Turkish description must be less than 200 characters'),
  icon: yup.string()
    .required('Icon is required')
    .matches(/^[a-zA-Z0-9:_-]+$/, 'Please enter a valid Iconify icon name'),
  requiresImages: yup.boolean(),
  isActive: yup.boolean()
});

function EditCategory() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState(null);
  
  const params = useParams();
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const categoryId = params.id;

  // Common icons for selection
  const commonIcons = [
    'mdi:cellphone',
    'mdi:laptop',
    'mdi:desktop-tower-monitor',
    'mdi:tablet',
    'mdi:watch',
    'mdi:headphones',
    'mdi:camera',
    'mdi:car',
    'mdi:home',
    'mdi:tools',
    'mdi:wrench',
    'mdi:hammer',
    'mdi:screwdriver',
    'mdi:cog',
    'mdi:electronic-chip',
    'mdi:battery',
    'mdi:gamepad-variant',
    'mdi:television',
    'mdi:washing-machine',
    'mdi:air-conditioner',
    'mdi:microwave',
    'mdi:refrigerator',
    'mdi:printer',
    'mdi:router-wireless'
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      nameTurkish: '',
      description: '',
      descriptionTurkish: '',
      icon: '',
      requiresImages: true,
      isActive: true
    }
  });

  const watchedIcon = watch('icon');

  // Fetch category data
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/admin/categories/${categoryId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const category = response.data.data.category;
        setCategoryData(category);
        
        // Populate form with existing data
        setValue('name', category.name);
        setValue('nameTurkish', category.nameTurkish);
        setValue('description', category.description);
        setValue('descriptionTurkish', category.descriptionTurkish);
        setValue('icon', category.icon);
        setValue('requiresImages', category.requiresImages);
        setValue('isActive', category.isActive);

      } catch (error) {
        console.error('Error fetching category:', error);
        setSubmitError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId && token) {
      fetchCategoryData();
    }
  }, [categoryId, token, setValue]);

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');

      const response = await axiosInstance.put(`/admin/categories/${categoryId}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update category');
      }

      setSubmitSuccess('Category updated successfully!');
      
      // Clear success message and redirect after 2 seconds
      setTimeout(() => {
        setSubmitSuccess('');
        router.push('/admin/categories');
      }, 2000);

    } catch (error) {
      console.error('Error updating category:', error);
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError(error.message || 'Failed to update category. Please try again.');
      }
    }
  };

  const selectIcon = (iconName) => {
    setValue('icon', iconName);
  };

  const handleCancel = () => {
    router.push('/admin/categories');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading category data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-20">
              <Icon icon="mdi:alert-circle" className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Category Not Found</h3>
              <p className="text-gray-500 mb-4">The category you're looking for doesn't exist or has been deleted.</p>
              <button
                onClick={handleCancel}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Categories
              </button>
            </div>
          </div>
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
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
                <p className="text-gray-600 mt-1">Update category information</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                <Icon icon={categoryData.icon} className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{categoryData.name}</p>
                <p className="text-xs text-gray-500">{categoryData.nameTurkish}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (English) *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter category name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Turkish Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Turkish) *
                </label>
                <input
                  type="text"
                  {...register('nameTurkish')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.nameTurkish ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kategori adını girin"
                />
                {errors.nameTurkish && (
                  <p className="mt-1 text-sm text-red-600">{errors.nameTurkish.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (English) *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter category description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Turkish Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Turkish) *
                </label>
                <textarea
                  {...register('descriptionTurkish')}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.descriptionTurkish ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kategori açıklamasını girin"
                />
                {errors.descriptionTurkish && (
                  <p className="mt-1 text-sm text-red-600">{errors.descriptionTurkish.message}</p>
                )}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon *
              </label>
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="text"
                  {...register('icon')}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.icon ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Iconify icon name (e.g., mdi:cellphone)"
                />
                {watchedIcon && (
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                    <Icon icon={watchedIcon} className="w-7 h-7 text-gray-700" />
                  </div>
                )}
              </div>
              
              {/* Common Icons Grid */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Quick select popular icons:</p>
                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
                  {commonIcons.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => selectIcon(iconName)}
                      className={`p-3 border rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-colors ${
                        watchedIcon === iconName 
                          ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200' 
                          : 'border-gray-200'
                      }`}
                      title={iconName}
                    >
                      <Icon icon={iconName} className="w-6 h-6 text-gray-700 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {errors.icon && (
                <p className="mt-1 text-sm text-red-600">{errors.icon.message}</p>
              )}
            </div>

            {/* Settings */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
              
              {/* Requires Images */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    {...register('requiresImages')}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    Requires Images
                  </label>
                  <p className="text-sm text-gray-500">
                    Check this if customers should upload images when creating repair requests for this category.
                  </p>
                </div>
              </div>

              {/* Is Active */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    Active Status
                  </label>
                  <p className="text-sm text-gray-500">
                    Inactive categories won't be visible to customers when creating repair requests.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Preview */}
            {(watchedIcon || watch('name') || watch('nameTurkish')) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm">
                      {watchedIcon && <Icon icon={watchedIcon} className="w-7 h-7 text-gray-700" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h4 className="text-base font-medium text-gray-900">
                          {watch('name') || 'Category Name'}
                        </h4>
                        {watch('nameTurkish') && (
                          <span className="text-sm text-gray-500">
                            ({watch('nameTurkish')})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {watch('description') || 'Category description will appear here...'}
                      </p>
                      {watch('descriptionTurkish') && (
                        <p className="text-sm text-gray-500">
                          {watch('descriptionTurkish')}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          watch('requiresImages') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Icon 
                            icon={watch('requiresImages') ? 'mdi:camera' : 'mdi:camera-off'} 
                            className="w-3 h-3 mr-1" 
                          />
                          {watch('requiresImages') ? 'Images Required' : 'No Images Required'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          watch('isActive') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <Icon 
                            icon={watch('isActive') ? 'mdi:eye' : 'mdi:eye-off'} 
                            className="w-3 h-3 mr-1" 
                          />
                          {watch('isActive') ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                Update Category
              </button>
            </div>
          </div>
        </div>

        {/* Category Info */}
        <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-6">
          <div className="flex items-start">
            <Icon icon="mdi:information" className="w-5 h-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-primary-900 mb-2">Category Information:</h3>
              <div className="text-sm text-primary-800 space-y-1">
                <p>• <strong>Created:</strong> {new Date(categoryData.createdAt).toLocaleDateString()}</p>
                <p>• <strong>Last Updated:</strong> {new Date(categoryData.updatedAt).toLocaleDateString()}</p>
                <p>• <strong>Category ID:</strong> {categoryData._id}</p>
                <p>• <strong>Slug:</strong> {categoryData.slug}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCategory;