"use client"

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
    partsQuality: yup
        .string()
        .required('Parts quality is required')
        .oneOf(['original', 'a-plus', 'china-copy', 'refurbished-original', 'other'], 'Invalid parts quality'),
    basePrice: yup
        .number()
        .required('Base price is required')
        .positive('Base price must be a positive number')
        .typeError('Base price must be a valid number'),
    serviceCharges: yup
        .number()
        .when('serviceType', {
            is: 'pickup',
            then: (schema) => schema.required('Service charges required').positive(),
            otherwise: (schema) => schema.nullable().default(0)
        }),

    dropoffAddress: yup
        .string()
        .when('serviceType', {
            is: 'drop-off',
            then: (schema) => schema.required('Drop-off address is required'),
            otherwise: (schema) => schema.nullable()
        }),
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
        .number()
        .required('Estimated duration is required')
        .positive('Duration must be positive')
        .typeError('Estimated duration must be a number'),
    serviceType: yup
        .string()
        .required('Service type is required')
        .oneOf(['drop-off', 'pickup'], 'Invalid service type'),
    warranty: yup
        .number()
        .min(0, 'Warranty cannot be negative')
        .nullable()
        .typeError('Warranty must be a number'),
    repairmanNotes: yup
        .string()
        .max(200, 'Notes cannot exceed 200 characters')
        .nullable()
});

const QuotationForm = ({ chatId, onClose, onSuccess }) => {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);
    const [currentService, setCurrentService] = useState('');
    const [customService, setCustomService] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [dropoffAddress, setDropoffAddress] = useState('');

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
            partsQuality: 'original',
            basePrice: '',
            serviceCharges: 0,
            partsPrice: 0,
            dropoffAddress: '',
            description: '',
            estimatedDuration: '',
            serviceType: 'drop-off',
            warranty: '',
            repairmanNotes: ''
        }
    });

    const watchedServiceType = watch('serviceType');
    const watchedBasePrice = watch('basePrice');
    const watchedServiceCharges = watch('serviceCharges');
    const watchedPartsPrice = watch('partsPrice');
    const watchedDescription = watch('description');
    const watchedRepairmanNotes = watch('repairmanNotes');
    const watchedDropoffAddress = watch('dropoffAddress');

    const serviceTypeOptions = [
        { value: 'drop-off', label: 'Drop-off Service' },
        { value: 'pickup', label: 'Pickup Service' },
    ];

    // ✅ Calculate subtotal (without service charges)
    const calculateSubtotal = () => {
        const basePrice = parseFloat(watchedBasePrice) || 0;
        const partsPrice = parseFloat(watchedPartsPrice) || 0;
        return basePrice + partsPrice;
    };

    // ✅ Calculate grand total (with service charges)
    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const serviceCharges = (watchedServiceType === 'pickup')
            ? (parseFloat(watchedServiceCharges) || 0)
            : 0;
        return subtotal + serviceCharges;
    };

    const handleAddService = () => {
        if (showCustomInput) {
            if (customService.trim() && !selectedServices.includes(customService.trim())) {
                setSelectedServices([...selectedServices, customService.trim()]);
                setCustomService('');
                setShowCustomInput(false);
            }
        } else {
            if (currentService && !selectedServices.includes(currentService)) {
                setSelectedServices([...selectedServices, currentService]);
                setCurrentService('');
            }
        }
    };

    const handleRemoveService = (serviceToRemove) => {
        setSelectedServices(selectedServices.filter(service => service !== serviceToRemove));
    };

    const handleServiceDropdownChange = (value) => {
        if (value === '__custom__') {
            setShowCustomInput(true);
            setCurrentService('');
        } else {
            setCurrentService(value);
            setShowCustomInput(false);
        }
    };

    const onSubmit = async (data) => {
        if (selectedServices.length === 0) {
            handleError({ message: 'Please add at least one repair service' });
            return;
        }

        setLoading(true);

        try {
            const quotationData = {
                deviceInfo: {
                    brandName: data.brandName.trim(),
                    modelName: data.modelName.trim(),
                    repairServices: selectedServices
                },
                partsQuality: data.partsQuality,
                basePrice: parseFloat(data.basePrice),
                partsPrice: parseFloat(data.partsPrice) || 0,
                description: data.description.trim(),
                estimatedDuration: data.estimatedDuration.toString(),
                ...(data.warranty && { warranty: data.warranty.toString() }),
                ...(data.repairmanNotes && { repairmanNotes: data.repairmanNotes.trim() }),

                // ✅ Service Type based conditional data
                ...(data.serviceType === 'pickup' && {
                    serviceType: 'pickup',
                    serviceCharges: parseFloat(data.serviceCharges) || 0,
                    isPickup: true,
                    isDropoff: false,
                    pickupLocation: {
                        address: '' // Customer will provide during payment
                    },
                    dropoffLocation: {
                        address: ''
                    }
                }),

                ...(data.serviceType === 'drop-off' && {
                    serviceType: 'drop-off',
                    serviceCharges: 0,
                    isPickup: false,
                    isDropoff: true,
                    pickupLocation: {
                        address: ''
                    },
                    dropoffLocation: {
                        address: data.dropoffAddress.trim()
                    }
                })
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
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.brandName ? 'border-red-500' : 'border-gray-300'
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
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.modelName ? 'border-red-500' : 'border-gray-300'
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
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Repair Services *</h3>

                            <div className="flex gap-2 mb-3">
                                {!showCustomInput ? (
                                    <select
                                        value={currentService}
                                        onChange={(e) => handleServiceDropdownChange(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select a service</option>
                                        {PREDEFINED_SERVICES.map(service => (
                                            <option
                                                key={service}
                                                value={service}
                                                disabled={selectedServices.includes(service)}
                                            >
                                                {service}
                                            </option>
                                        ))}
                                        <option value="__custom__">+ Add Custom Service</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2 flex-1">
                                        <input
                                            type="text"
                                            value={customService}
                                            onChange={(e) => setCustomService(e.target.value)}
                                            placeholder="Enter custom service name"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCustomInput(false);
                                                setCustomService('');
                                            }}
                                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                            title="Back to dropdown"
                                        >
                                            <Icon icon="mdi:arrow-left" width={16} />
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleAddService}
                                    disabled={showCustomInput ? !customService.trim() : !currentService}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                >
                                    <Icon icon="mdi:plus" width={16} />
                                    Add
                                </button>
                            </div>

                            {/* Selected Services Display */}
                            {selectedServices.length > 0 && (
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Selected Services:</p>
                                    <div className="space-y-2">
                                        {selectedServices.map((service, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                                            >
                                                <span className="text-sm text-gray-700">{service}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveService(service)}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                >
                                                    <Icon icon="mdi:close" width={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedServices.length === 0 && (
                                <p className="text-red-500 text-xs mt-1">Please add at least one repair service</p>
                            )}
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
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
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
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.serviceType ? 'border-red-500' : 'border-gray-300'
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




                        {/* Pricing Section */}
                        <div className="bg-gray-50 p-4 rounded-md space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Pricing Details</h3>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Base Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Base Price (TRY) *
                                    </label>
                                    <Controller
                                        name="basePrice"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.basePrice ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                        )}
                                    />
                                    {errors.basePrice && (
                                        <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>
                                    )}
                                </div>

                                {/* Parts Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Parts Price (TRY)
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
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.partsPrice ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                        )}
                                    />
                                    {errors.partsPrice && (
                                        <p className="text-red-500 text-xs mt-1">{errors.partsPrice.message}</p>
                                    )}
                                </div>
                            </div>

                            {watchedServiceType === 'drop-off' && (
                                <div>
                                    <label>Drop-off Location Address *</label>
                                    <Controller
                                        name="dropoffAddress"
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                placeholder="Enter your shop/service center address..."
                                                rows={2}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.dropoffAddress ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                        )}
                                    />
                                    {errors.dropoffAddress && (
                                        <p className="text-red-500 text-xs mt-1">{errors.dropoffAddress.message}</p>
                                    )}
                                </div>
                            )}

                            {watchedServiceType === 'pickup' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pickup Service Charges (TRY) *
                                    </label>
                                    <Controller
                                        name="serviceCharges"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.serviceCharges ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                        )}
                                    />
                                    {errors.serviceCharges && (
                                        <p className="text-red-500 text-xs mt-1">{errors.serviceCharges.message}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Additional charge for pickup service
                                    </p>
                                </div>
                            )}

                            {/* ✅ Price Breakdown Display */}
                            <div className="bg-white border border-gray-200 rounded-md p-3 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Base Price:</span>
                                    <span className="font-medium">₺{(parseFloat(watchedBasePrice) || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Parts Price:</span>
                                    <span className="font-medium">₺{(parseFloat(watchedPartsPrice) || 0).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between items-center text-sm font-semibold">
                                    <span className="text-gray-700">Subtotal:</span>
                                    <span>₺{calculateSubtotal().toFixed(2)}</span>
                                </div>

                                {watchedServiceType === 'pickup' && parseFloat(watchedServiceCharges) > 0 && (
                                    <>
                                        <div className="flex justify-between items-center text-sm text-primary-600">
                                            <span>Pickup Charges:</span>
                                            <span className="font-medium">+₺{(parseFloat(watchedServiceCharges) || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="border-t pt-2"></div>
                                    </>
                                )}
                            </div>

                            {/* ✅ Grand Total Display */}
                            <div className="bg-primary-600 p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-white">Grand Total:</span>
                                    <span className="text-lg font-bold text-white">
                                        ₺{calculateGrandTotal().toFixed(2)}
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
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.partsQuality ? 'border-red-500' : 'border-gray-300'
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
                                    Estimated Duration (days) *
                                </label>
                                <Controller
                                    name="estimatedDuration"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="e.g., 2"
                                            min="0"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                    )}
                                />
                                {errors.estimatedDuration && (
                                    <p className="text-red-500 text-xs mt-1">{errors.estimatedDuration.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Warranty & Notes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Warranty (days)
                                </label>
                                <Controller
                                    name="warranty"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="e.g., 30"
                                            min="0"
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