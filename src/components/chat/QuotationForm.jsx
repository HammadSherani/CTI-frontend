"use client"

import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';

// Predefined service options
const PREDEFINED_SERVICES = [
    'Screen Replacement',
    'Battery Replacement',
    'Charging Port Repair',
    'Camera Repair',
    'Speaker Repair',
    'Microphone Repair',
    'Water Damage Repair',
    'Software Update',
    'Data Recovery',
    'Back Glass Replacement',
    'Button Repair',
    'Face ID Repair',
    'Touch ID Repair',
    'Logic Board Repair',
    'Network Issue Fix',
    'Motherboard Repair',
    'Display Replacement',
    'Fingerprint Sensor Repair',
    'Vibration Motor Repair',
    'SIM Card Slot Repair'
];

const quotationSchema = yup.object().shape({
    brandName: yup
        .string()
        .required('Brand name is required')
        .min(2, 'Brand name must be at least 2 characters'),
    modelName: yup
        .string()
        .required('Model name is required')
        .min(2, 'Model name must be at least 2 characters'),
    repairServices: yup
        .array()
        .of(yup.string().required('Service name is required'))
        .min(1, 'At least one service is required'),
    partsQuality: yup
        .string()
        .required('Parts quality is required')
        .oneOf(['original', 'a-plus', 'china-copy', 'refurbished-original', 'other'], 'Invalid parts quality'),
    serviceCharge: yup
        .number()
        .required('Service charge is required')
        .positive('Service charge must be a positive number')
        .typeError('Service charge must be a valid number'),
    partsPrice: yup
        .number()
        .min(0, 'Parts price cannot be negative')
        .default(0)
        .typeError('Parts price must be a valid number'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description cannot exceed 500 characters'),
    estimatedDuration: yup
        .string()
        .required('Estimated duration is required')
        .min(1, 'Estimated duration is required'),
    serviceType: yup
        .string()
        .required('Service type is required')
        .oneOf(['drop-off', 'pickup', 'home-service'], 'Invalid service type'),
    warranty: yup
        .string()
        .max(100, 'Warranty cannot exceed 100 characters')
        .nullable(),
    repairmanNotes: yup
        .string()
        .max(200, 'Notes cannot exceed 200 characters')
        .nullable()
});

const QuotationForm = ({ chatId, onClose, onSuccess }) => {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState({});

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(quotationSchema),
        defaultValues: {
            brandName: '',
            modelName: '',
            repairServices: [''],
            partsQuality: 'original',
            serviceCharge: '',
            partsPrice: 0,
            description: '',
            estimatedDuration: '',
            serviceType: 'drop-off',
            warranty: '',
            repairmanNotes: ''
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'repairServices'
    });

    const watchedServiceCharge = watch('serviceCharge');
    const watchedPartsPrice = watch('partsPrice');
    const watchedDescription = watch('description');
    const watchedRepairmanNotes = watch('repairmanNotes');

    const serviceTypeOptions = [
        { value: 'drop-off', label: 'Drop-off Service' },
        { value: 'pickup', label: 'Pickup Service' },
        { value: 'home-service', label: 'Home Service' }
    ];

    const calculateTotal = () => {
        const serviceCharge = parseFloat(watchedServiceCharge) || 0;
        const partsPrice = parseFloat(watchedPartsPrice) || 0;
        return serviceCharge + partsPrice;
    };

    const handleAddService = () => {
        append('');
    };

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            // Filter out empty services
            const filteredServices = data.repairServices.filter(service => service && service.trim());

            if (filteredServices.length === 0) {
                handleError({ message: 'Please add at least one repair service' });
                setLoading(false);
                return;
            }

            const quotationData = {
                deviceInfo: {
                    brandName: data.brandName.trim(),
                    modelName: data.modelName.trim(),
                    repairServices: filteredServices.map(s => s.trim())
                },
                partsQuality: data.partsQuality,
                serviceCharge: parseFloat(data.serviceCharge),
                partsPrice: parseFloat(data.partsPrice) || 0,
                description: data.description.trim(),
                estimatedDuration: data.estimatedDuration.trim(),
                serviceType: data.serviceType,
                ...(data.warranty && { warranty: data.warranty.trim() }),
                ...(data.repairmanNotes && { repairmanNotes: data.repairmanNotes.trim() })
            };

            console.log('Sending quotation data:', quotationData);

            const response = await axiosInstance.post(
                `/chat/${chatId}/send-quotation`,
                quotationData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                onSuccess?.(response.data.data.quotation);
                onClose();
            }
        } catch (error) {
            console.error('Send quotation error:', error);
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Create Quotation</h2>
                    <Icon
                        icon="mdi:close"
                        width={24}
                        className="cursor-pointer hover:opacity-70"
                        onClick={onClose}
                    />
                </div>

                {/* Form */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Device Information Section */}
                        <div className="bg-primary-50 p-4 rounded-md space-y-3">
                            <h3 className="text-sm font-semibold text-primary-900 mb-2">Device Information</h3>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Brand Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand Name *
                                    </label>
                                    <Controller
                                        name="brandName"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                placeholder="e.g., Apple, Samsung, Huawei"
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                    errors.brandName ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                        )}
                                    />
                                    {errors.brandName && (
                                        <p className="text-red-500 text-xs mt-1">{errors.brandName.message}</p>
                                    )}
                                </div>

                                {/* Model Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Model Name *
                                    </label>
                                    <Controller
                                        name="modelName"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                placeholder="e.g., iPhone 14 Pro, Galaxy S23"
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                    errors.modelName ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                        )}
                                    />
                                    {errors.modelName && (
                                        <p className="text-red-500 text-xs mt-1">{errors.modelName.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Repair Services Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900">Repair Services *</h3>
                                <button
                                    type="button"
                                    onClick={handleAddService}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                >
                                    <Icon icon="mdi:plus" width={16} />
                                    Add Service
                                </button>
                            </div>

                            {errors.repairServices?.message && (
                                <p className="text-red-500 text-sm mb-2">{errors.repairServices.message}</p>
                            )}

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <Controller
                                                name={`repairServices.${index}`}
                                                control={control}
                                                render={({ field: serviceField }) => (
                                                    <div className="space-y-2">
                                                        {!showCustomInput[index] ? (
                                                            <select
                                                                value={serviceField.value}
                                                                onChange={(e) => {
                                                                    if (e.target.value === '__custom__') {
                                                                        setShowCustomInput(prev => ({ ...prev, [index]: true }));
                                                                        serviceField.onChange('');
                                                                    } else {
                                                                        serviceField.onChange(e.target.value);
                                                                    }
                                                                }}
                                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                                    errors.repairServices?.[index] ? 'border-red-500' : 'border-gray-300'
                                                                }`}
                                                            >
                                                                <option value="">Select a service</option>
                                                                {PREDEFINED_SERVICES.map(service => (
                                                                    <option key={service} value={service}>
                                                                        {service}
                                                                    </option>
                                                                ))}
                                                                <option value="__custom__">+ Add Custom Service</option>
                                                            </select>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    {...serviceField}
                                                                    placeholder="Enter custom service name"
                                                                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                                        errors.repairServices?.[index] ? 'border-red-500' : 'border-gray-300'
                                                                    }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setShowCustomInput(prev => ({ ...prev, [index]: false }));
                                                                        serviceField.onChange('');
                                                                    }}
                                                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                                                    title="Back to dropdown"
                                                                >
                                                                    <Icon icon="mdi:arrow-left" width={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.repairServices?.[index] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.repairServices[index].message}
                                                </p>
                                            )}
                                        </div>
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="mt-2 text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Icon icon="mdi:delete" width={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Service Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Description *
                            </label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        {...field}
                                        placeholder="Describe the repair work to be done in detail..."
                                        rows={3}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                            errors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        maxLength={500}
                                    />
                                )}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                {watchedDescription?.length || 0}/500 characters
                            </p>
                        </div>

                        {/* Pricing Section */}
                        <div className="bg-gray-50 p-4 rounded-md space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Pricing Details</h3>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {/* Service Charge */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Service Charge (PKR) *
                                    </label>
                                    <Controller
                                        name="serviceCharge"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                    errors.serviceCharge ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                        )}
                                    />
                                    {errors.serviceCharge && (
                                        <p className="text-red-500 text-xs mt-1">{errors.serviceCharge.message}</p>
                                    )}
                                </div>

                                {/* Parts Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Parts Price (PKR)
                                    </label>
                                    <Controller
                                        name="partsPrice"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                    errors.partsPrice ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                        )}
                                    />
                                    {errors.partsPrice && (
                                        <p className="text-red-500 text-xs mt-1">{errors.partsPrice.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Total Amount Display */}
                            <div className="bg-primary-600 p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-white">Total Amount:</span>
                                    <span className="text-lg font-bold text-white">
                                        PKR {calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Parts Quality & Estimated Duration */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parts Quality *
                                </label>
                                <Controller
                                    name="partsQuality"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                errors.partsQuality ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="original">Original</option>
                                            <option value="a-plus">A-Plus</option>
                                            <option value="china-copy">China Copy</option>
                                            <option value="refurbished-original">Refurbished Original</option>
                                            <option value="other">Other</option>
                                        </select>
                                    )}
                                />
                                {errors.partsQuality && (
                                    <p className="text-red-500 text-xs mt-1">{errors.partsQuality.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Duration *
                                </label>
                                <Controller
                                    name="estimatedDuration"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="e.g., 2 hours, 1 day"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                    )}
                                />
                                {errors.estimatedDuration && (
                                    <p className="text-red-500 text-xs mt-1">{errors.estimatedDuration.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Service Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Type *
                            </label>
                            <Controller
                                name="serviceType"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                            errors.serviceType ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        {serviceTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.serviceType && (
                                <p className="text-red-500 text-xs mt-1">{errors.serviceType.message}</p>
                            )}
                        </div>

                        {/* Warranty & Notes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Warranty
                                </label>
                                <Controller
                                    name="warranty"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="e.g., 30 days, 3 months"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                />
                                {errors.warranty && (
                                    <p className="text-red-500 text-xs mt-1">{errors.warranty.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Notes
                                </label>
                                <Controller
                                    name="repairmanNotes"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="Any additional information..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            maxLength={200}
                                        />
                                    )}
                                />
                                {errors.repairmanNotes && (
                                    <p className="text-red-500 text-xs mt-1">{errors.repairmanNotes.message}</p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                    {watchedRepairmanNotes?.length || 0}/200 characters
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:send" width={16} />
                                        Send Quotation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuotationForm;