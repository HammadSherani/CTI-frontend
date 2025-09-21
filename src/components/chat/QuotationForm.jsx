"use client"

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';

// Validation schema
const quotationSchema = yup.object().shape({
    description: yup
        .string()
        .required('Service description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description cannot exceed 500 characters'),
    serviceCharge: yup
        .number()
        .required('Service charge is required')
        .positive('Service charge must be a positive number')
        .typeError('Service charge must be a valid number'),
    partsPrice: yup
        .number()
        .min(0, 'Parts price cannot be negative')
        .nullable()
        .transform((value, originalValue) => originalValue === '' ? null : value),
    estimatedDuration: yup
        .string()
        .required('Estimated duration is required')
        .min(1, 'Estimated duration is required'),
    serviceType: yup
        .string()
        .required('Service type is required')
        .oneOf(['drop-off', 'pickup', 'home-service'], 'Invalid service type'),
    validityDuration: yup
        .number()
        .required('Validity duration is required')
        .min(1, 'Validity must be at least 1 hour')
        .max(168, 'Validity cannot exceed 7 days (168 hours)')
        .typeError('Validity duration must be a valid number'),
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

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(quotationSchema),
        defaultValues: {
            description: '',
            serviceCharge: '',
            partsPrice: '',
            estimatedDuration: '',
            serviceType: 'drop-off',
            validityDuration: 24, // Default 24 hours
            warranty: '',
            repairmanNotes: ''
        }
    });

    const serviceTypeOptions = [
        { value: 'drop-off', label: 'Drop-off Service' },
        { value: 'pickup', label: 'Pickup Service' },
        { value: 'home-service', label: 'Home Service' }
    ];

    // Watch form values for total calculation
    const watchedValues = watch(['serviceCharge', 'partsPrice', 'validityDuration']);
    const calculateTotal = () => {
        const serviceCharge = parseFloat(watchedValues[0]) || 0;
        const partsPrice = parseFloat(watchedValues[1]) || 0;
        return serviceCharge + partsPrice;
    };

    const calculateValidUntil = () => {
        const hours = parseInt(watchedValues[2]) || 24;
        const validUntil = new Date();
        validUntil.setHours(validUntil.getHours() + hours);
        return validUntil;
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const validUntil = new Date();
            validUntil.setHours(validUntil.getHours() + parseInt(data.validityDuration));

            const quotationData = {
                description: data.description.trim(),
                serviceCharge: parseFloat(data.serviceCharge),
                partsPrice: parseFloat(data.partsPrice) || 0,
                estimatedDuration: data.estimatedDuration.trim(),
                serviceType: data.serviceType,
                validUntil: validUntil.toISOString(),
                ...(data.warranty && { warranty: data.warranty.trim() }),
                ...(data.repairmanNotes && { repairmanNotes: data.repairmanNotes.trim() })
            };

            const response = await axiosInstance.post(
                `/chat/${chatId}/send-quotation`,
                quotationData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                onSuccess?.(response.data.quotation);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Create Quotation</h2>
                    <Icon 
                        icon="mdi:close" 
                        width={24} 
                        className="cursor-pointer hover:opacity-70"
                        onClick={onClose}
                    />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="space-y-4">
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
                                        placeholder="Describe the repair work to be done..."
                                        rows={3}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                                {watch('description')?.length || 0}/500 characters
                            </p>
                        </div>

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
                                        placeholder="Enter service charge"
                                        min="0"
                                        step="0.01"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                                        placeholder="Enter parts cost (if any)"
                                        min="0"
                                        step="0.01"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.partsPrice ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                )}
                            />
                            {errors.partsPrice && (
                                <p className="text-red-500 text-xs mt-1">{errors.partsPrice.message}</p>
                            )}
                        </div>

                        {/* Total Amount Display */}
                        <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Total Amount:</span>
                                <span className="text-lg font-bold text-blue-600">
                                    PKR {calculateTotal().toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Estimated Duration */}
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
                                        placeholder="e.g., 2-3 hours, 1-2 days"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                )}
                            />
                            {errors.estimatedDuration && (
                                <p className="text-red-500 text-xs mt-1">{errors.estimatedDuration.message}</p>
                            )}
                        </div>

                        {/* Validity Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quotation Valid For (Hours) *
                            </label>
                            <Controller
                                name="validityDuration"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="Enter hours (e.g., 24)"
                                            min="1"
                                            max="168"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                errors.validityDuration ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(24)}
                                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
                                            >
                                                24 hours
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(48)}
                                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
                                            >
                                                2 days
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(72)}
                                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
                                            >
                                                3 days
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(168)}
                                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
                                            >
                                                1 week
                                            </button>
                                        </div>
                                        {watchedValues[2] && (
                                            <p className="text-sm text-gray-600">
                                                Valid until: {calculateValidUntil().toLocaleDateString()} at{' '}
                                                {calculateValidUntil().toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                            {errors.validityDuration && (
                                <p className="text-red-500 text-xs mt-1">{errors.validityDuration.message}</p>
                            )}
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                        {/* Warranty */}
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            />
                            {errors.warranty && (
                                <p className="text-red-500 text-xs mt-1">{errors.warranty.message}</p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Notes
                            </label>
                            <Controller
                                name="repairmanNotes"
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        {...field}
                                        placeholder="Any additional information..."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        maxLength={200}
                                    />
                                )}
                            />
                            {errors.repairmanNotes && (
                                <p className="text-red-500 text-xs mt-1">{errors.repairmanNotes.message}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                {watch('repairmanNotes')?.length || 0}/200 characters
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-4 border-t">
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
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
    );
};

export default QuotationForm;