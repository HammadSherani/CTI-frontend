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

// Validation schema
const partSchema = yup.object().shape({
  name: yup
    .string()
    .required('Part name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must not exceed 200 characters'),
  brand: yup
    .string()
    .required('Brand is required'),
  model: yup
    .string()
    .required('Model is required'),
  category: yup
    .string()
    .required('Category is required'),
  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be positive')
    .typeError('Price must be a number'),
  repairmanPrice: yup
    .number()
    .positive('Repairman price must be positive')
    .typeError('Repairman price must be a number')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  costPrice: yup
    .number()
    .positive('Cost price must be positive')
    .typeError('Cost price must be a number')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  discount: yup
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .typeError('Discount must be a number')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  stock: yup
    .number()
    .min(0, 'Stock cannot be negative')
    .typeError('Stock must be a number')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  lowStockAlert: yup
    .number()
    .min(0, 'Low stock alert cannot be negative')
    .typeError('Low stock alert must be a number')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  sku: yup
    .string()
    .nullable(),
  partType: yup
    .string()
    .required('Part Type is required'),
  color: yup
    .string()
    .nullable(),
  warranty: yup
    .string()
    .nullable(),
  condition: yup
    .string()
    .nullable(),
  description: yup
    .string()
    .nullable(),
  installationNotes: yup
    .string()
    .nullable(),
  returnPolicy: yup
    .string()
    .nullable(),
  compatibility: yup
    .array()
    .nullable(),
  images: yup
    .mixed()
    .test('fileCount', 'You can upload maximum 10 images', (value) => {
      if (!value || value.length === 0) return true;
      return value.length <= 10;
    })
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value || value.length === 0) return true;
      return Array.from(value).every(file => file.type.startsWith('image/'));
    })
    .test('fileSize', 'Each image must be less than 5MB', (value) => {
      if (!value || value.length === 0) return true;
      return Array.from(value).every(file => file.size <= 5 * 1024 * 1024);
    }),
  isActive: yup.boolean(),
  isFeatured: yup.boolean(),
});

function CreatePart() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [compatibilityOptions, setCompatibilityOptions] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
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
      name: '',
      brand: '',
      model: '',
      category: '',
      partType: '',
      compatibility: [],
      color: '',
      warranty: '',
      condition: 'New',
      price: '',
      repairmanPrice: '',
      costPrice: '',
      discount: 0,
      stock: 0,
      lowStockAlert: 5,
      sku: '',
      description: '',
      installationNotes: '',
      returnPolicy: '',
      images: null,
      isActive: true,
      isFeatured: false,
    },
  });

  const watchedIsActive = watch('isActive');
  const watchedIsFeatured = watch('isFeatured');
  const watchedBrand = watch('brand');
  const watchedPrice = watch('price');
  const watchedDiscount = watch('discount');

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (watchedPrice && watchedDiscount) {
      const discounted = watchedPrice - (watchedPrice * watchedDiscount / 100);
      return discounted.toFixed(2);
    }
    return watchedPrice || 0;
  };

  // Fetch brands
  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (watchedBrand) {
      fetchModels(watchedBrand);
      fetchCompatibility(watchedBrand);
    } else {
      setModels([]);
      setCompatibilityOptions([]);
    }
  }, [watchedBrand]);

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const response = await axiosInstance.get('/public/brands', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrands(response.data.data.brands || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModels = async (brandId) => {
    try {
      setLoadingModels(true);
      const response = await axiosInstance.get(`/public/models/brand/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModels(response.data.data?.models || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to load models');
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axiosInstance.get('/admin/parts/parts-categories/get-categories', {
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

  const fetchCompatibility = async (brandId) => {
    try {
      const response = await axiosInstance.get(`/admin/models/brand/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompatibilityOptions(response.data.data.models || []);
    } catch (error) {
      console.error('Error fetching compatibility:', error);
    }
  };

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 10) {
      toast.error('You can upload maximum 10 images');
      return;
    }

    // Validate each file
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

    // Create previews
    const previews = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({ id: Date.now() + index, url: e.target.result, file });
        if (previews.length === files.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImagePreviews(prev => prev.filter(img => img.id !== id));
    const fileInput = document.getElementById('images');
    if (imagePreviews.length === 1 && fileInput) {
      fileInput.value = '';
      setValue('images', null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');
      setUploadProgress(0);

      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all fields
      formData.append('name', data.name);
      formData.append('brand', data.brand);
      formData.append('model', data.model);
      formData.append('category', data.category);
      formData.append('price', data.price);
      formData.append('isActive', data.isActive);
      formData.append('isFeatured', data.isFeatured);

      // Optional fields
      if (data.partType) formData.append('partType', data.partType);
      if (data.color) formData.append('color', data.color);
      if (data.warranty) formData.append('warranty', data.warranty);
      if (data.condition) formData.append('condition', data.condition);
      if (data.repairmanPrice) formData.append('repairmanPrice', data.repairmanPrice);
      if (data.costPrice) formData.append('costPrice', data.costPrice);
      if (data.discount) formData.append('discount', data.discount);
      if (data.stock !== null) formData.append('stock', data.stock);
      if (data.lowStockAlert) formData.append('lowStockAlert', data.lowStockAlert);
      if (data.sku) formData.append('sku', data.sku);
      if (data.description) formData.append('description', data.description);
      if (data.installationNotes) formData.append('installationNotes', data.installationNotes);
      if (data.returnPolicy) formData.append('returnPolicy', data.returnPolicy);

      // Compatibility array
      if (data.compatibility && data.compatibility.length > 0) {
        data.compatibility.forEach(comp => {
          formData.append('compatibility', comp);
        });
      }

      // Add images if provided
      if (imagePreviews.length > 0) {
        imagePreviews.forEach(preview => {
          formData.append('images', preview.file);
        });
      }

      // Make API call with progress tracking
      const response = await axiosInstance.post('/admin/parts', formData, {
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
      toast.success(response.data.message || 'Part created successfully!');
      setSubmitSuccess('Part created successfully!');

      // Reset form and previews
      reset();
      setImagePreviews([]);
      setUploadProgress(0);

      // Navigate back to parts list after 2 seconds
      setTimeout(() => {
        router.push('/admin/parts/stock-management');
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
    setImagePreviews([]);
    setSubmitError('');
    setSubmitSuccess('');
    setUploadProgress(0);
    router.push('/admin/parts');
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
                <h1 className="text-3xl font-bold text-gray-900">Create New Part</h1>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Part Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Part Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Front Brake Pad Set, Engine Oil Filter"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <select
                    id="brand"
                    {...register('brand')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.brand ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loadingBrands}
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand._id} value={brand._id}>{brand.name}</option>
                    ))}
                  </select>
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <select
                    id="model"
                    {...register('model')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.model ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={!watchedBrand || loadingModels}
                  >
                    <option value="">Select Model</option>
                    {models.map(model => (
                      <option key={model._id} value={model._id}>{model.name}</option>
                    ))}
                  </select>
                  {errors.model && (
                    <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
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
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                {/* Part Type */}
                <div>
                  <label htmlFor="partType" className="block text-sm font-medium text-gray-700 mb-2">
                    Part Type
                  </label>
                  {/* <input
                    id="partType"
                    type="text"
                    {...register('partType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., OEM, Aftermarket, Performance"
                  /> */}



                  <select
                    id="partType"
                    {...register('partType')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.partType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    // disabled={loadingCategories}
                  >
                    <option value="">Select partType</option>
                    <option value="Original">Original</option>
                    <option value="OEM">OEM</option>
                    <option value="AAA">AAA</option>
                    <option value="Aftermarket">Aftermarket</option>
                    {/* {categories.map(partType => (
                      <option key={partType._id} value={partType._id}>{partType.name}</option>
                    ))} */}
                  </select>
                  {errors.partType && (
                    <p className="mt-1 text-sm text-red-600">{errors.partType.message}</p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    id="sku"
                    type="text"
                    {...register('sku')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., BRK-001-FR"
                  />
                </div>

                {/* Condition */}
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    id="condition"
                    {...register('condition')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    id="color"
                    type="text"
                    {...register('color')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Black, Silver, Red"
                  />
                </div>

                {/* Warranty */}
                <div>
                  <label htmlFor="warranty" className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty
                  </label>
                  <input
                    id="warranty"
                    type="text"
                    {...register('warranty')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 1 Year, 6 Months"
                  />
                </div>

                {/* Compatibility */}
                <div className="md:col-span-2">
                  <label htmlFor="compatibility" className="block text-sm font-medium text-gray-700 mb-2">
                    Compatible Models
                  </label>
                  <Controller
                    name="compatibility"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        multiple
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-32"
                        disabled={!watchedBrand}
                      >
                        {compatibilityOptions.map(model => (
                          <option key={model._id} value={model._id}>{model.name}</option>
                        ))}
                      </select>
                    )}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Hold Ctrl (Cmd on Mac) to select multiple models
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:currency-usd" className="w-6 h-6 text-primary-600" />
                Pricing & Inventory
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                {/* Repairman Price */}
                <div>
                  <label htmlFor="repairmanPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Repairman Price (USD)
                  </label>
                  <input
                    id="repairmanPrice"
                    type="number"
                    step="0.01"
                    {...register('repairmanPrice')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price (USD)
                  </label>
                  <input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    {...register('costPrice')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Discount */}
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    id="discount"
                    type="number"
                    step="0.01"
                    {...register('discount')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.discount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.discount && (
                    <p className="mt-1 text-sm text-red-600">{errors.discount.message}</p>
                  )}
                </div>

                {/* Discounted Price Display */}
                {watchedDiscount > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Price
                    </label>
                    <div className="w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 text-green-700 font-semibold">
                      ${calculateDiscountedPrice()}
                    </div>
                  </div>
                )}

                {/* Stock */}
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    id="stock"
                    type="number"
                    {...register('stock')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                  )}
                </div>

                {/* Low Stock Alert */}
                <div>
                  <label htmlFor="lowStockAlert" className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Alert Level
                  </label>
                  <input
                    id="lowStockAlert"
                    type="number"
                    {...register('lowStockAlert')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="5"
                  />
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
                {...register('images')}
                onChange={(e) => {
                  register('images').onChange(e);
                  handleImageChange(e);
                }}
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

            {/* Descriptions & Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:text-box" className="w-6 h-6 text-primary-600" />
                Descriptions & Policies
              </h2>
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

                {/* Installation Notes */}
                <div>
                  <label htmlFor="installationNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Installation Notes
                  </label>
                  <textarea
                    id="installationNotes"
                    {...register('installationNotes')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Special instructions or considerations for installation..."
                  />
                </div>

                {/* Return Policy */}
                <div>
                  <label htmlFor="returnPolicy" className="block text-sm font-medium text-gray-700 mb-2">
                    Return Policy
                  </label>
                  <textarea
                    id="returnPolicy"
                    {...register('returnPolicy')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Return policy and conditions for this part..."
                  />
                </div>
              </div>
            </div>

            {/* Status Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:cog" className="w-6 h-6 text-primary-600" />
                Part Settings
              </h2>
              <div className="space-y-4">
                {/* Active Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900 cursor-pointer">
                      Active Status
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Enable this part to be visible and available for purchase
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setValue('isActive', !watchedIsActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        watchedIsActive ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
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
                    <label className="text-sm font-medium text-gray-900 cursor-pointer">
                      Featured Part
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Featured parts are highlighted and appear prominently
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setValue('isFeatured', !watchedIsFeatured)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        watchedIsFeatured ? 'bg-yellow-500' : 'bg-gray-200'
                      }`}
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
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Create Part'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePart;