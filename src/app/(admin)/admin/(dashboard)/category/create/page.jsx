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
    requiresImages: yup.boolean()
});

function CreateCategory() {
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const router = useRouter();
    const {token} = useSelector((state) => state.auth);

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
            requiresImages: true
        }
    });

    const watchedIcon = watch('icon');

    const onSubmit = async (data) => {
        try {
            setSubmitError('');
            setSubmitSuccess('');

            // Here you would make the actual API call
            const response = await axiosInstance.post('/admin/categories', data, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
            });

            // Handle successful request
            toast.success(response.data.message);




            // Success
            setSubmitSuccess('Category created successfully!');
            reset();

            // Clear success message after 5 seconds
            setTimeout(() => setSubmitSuccess(''), 5000);

            // Optional: Navigate back to category list
            // router.push('/admin/categories');

        } catch (error) {
            console.error('Error creating category:', error);
            setSubmitError(error.message || 'Failed to create category. Please try again.');
        }
    };

    const selectIcon = (iconName) => {
        setValue('icon', iconName);
    };

    const handleCancel = () => {
        reset();
        setSubmitError('');
        setSubmitSuccess('');
        // Optional: Navigate back to category list
        router.push('/admin/category');
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
                            >
                                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Create New Category</h1>
                                <p className="text-gray-600 mt-1">Add a new repair service category</p>
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
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name (English) *
                                </label>
                                <input
                                    type="text"
                                    {...register('name')}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
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
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.nameTurkish ? 'border-red-500' : 'border-gray-300'
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
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
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
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.descriptionTurkish ? 'border-red-500' : 'border-gray-300'
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
                                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.icon ? 'border-red-500' : 'border-gray-300'
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
                                            className={`p-3 border rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-colors ${watchedIcon === iconName
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

                        {/* Requires Images */}
                        {/* <div className="border-t pt-6">
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
                                        Check this if customers should upload images when creating repair requests for this category. This helps technicians better understand the issue.
                                    </p>
                                </div>
                            </div>
                        </div> */}

                        {/* Form Preview
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
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${watch('requiresImages')
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    <Icon
                                                        icon={watch('requiresImages') ? 'mdi:camera' : 'mdi:camera-off'}
                                                        className="w-3 h-3 mr-1"
                                                    />
                                                    {watch('requiresImages') ? 'Images Required' : 'No Images Required'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )} */}

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
                                Create Category
                            </button>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                {/* <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <Icon icon="mdi:information" className="w-5 h-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-primary-900 mb-2">Tips for creating categories:</h3>
                            <ul className="text-sm text-primary-800 space-y-1">
                                <li>• Use clear, descriptive names that customers will easily understand</li>
                                <li>• Include both English and Turkish translations for better accessibility</li>
                                <li>• Choose icons that visually represent the repair service type</li>
                                <li>• Enable "Requires Images" for categories where visual assessment is important</li>
                                <li>• Keep descriptions concise but informative (10-200 characters)</li>
                            </ul>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default CreateCategory;