import { Icon } from '@iconify/react';
import React, { useState, useEffect } from 'react';

const EditOfferModal = ({ isOpen, onClose, offer, onUpdate, loading = false }) => {
    const [formData, setFormData] = useState({
        basePrice: '',
        partsEstimate: '',
        partsQuality: 'original',
        estimatedTime: '',
        timeUnit: 'hours',
        description: '',
        warranty: {
            duration: '',
            description: '',
            terms: ''
        },
        availability: {
            canStartBy: ''
        },
        serviceOptions: {
            pickupAvailable: false,
            pickupCharge: 0,
            homeService: false,
            homeServiceCharge: 0
        },
        modificationReason: ''
    });

    const [errors, setErrors] = useState({});

    // Parts quality options
    const partsQualityOptions = [
        { value: 'original', label: 'Original' },
        { value: 'a-plus', label: 'A+ Grade' },
        { value: 'china-copy', label: 'China Copy' },
        { value: 'refurbished-original', label: 'Refurbished Original' },
        { value: 'other', label: 'Other' }
    ];

    const timeUnits = [
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' }
    ];

    // Initialize form data when modal opens or offer changes
    useEffect(() => {
        if (isOpen && offer) {
            setFormData({
                basePrice: offer.pricing?.basePrice?.toString() || '',
                partsEstimate: offer.pricing?.partsEstimate?.toString() || '0',
                partsQuality: offer.pricing?.partsQuality || 'original',
                estimatedTime: offer.estimatedTime?.value?.toString() || '',
                timeUnit: offer.estimatedTime?.unit || 'hours',
                description: offer.description || '',
                warranty: {
                    duration: offer.warranty?.duration?.toString() || '',
                    description: offer.warranty?.description || '',
                    terms: offer.warranty?.terms || ''
                },
                availability: {
                    canStartBy: offer.availability?.canStartBy ? 
                        new Date(offer.availability.canStartBy).toISOString().slice(0, 16) : ''
                },
                serviceOptions: {
                    pickupAvailable: offer.serviceOptions?.pickupAvailable || false,
                    pickupCharge: offer.serviceOptions?.pickupCharge || 0,
                    homeService: offer.serviceOptions?.homeService || false,
                    homeServiceCharge: offer.serviceOptions?.homeServiceCharge || 0
                },
                modificationReason: ''
            });
            setErrors({});
        }
    }, [isOpen, offer]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.basePrice || formData.basePrice <= 0) {
            newErrors.basePrice = 'Base price is required and must be greater than 0';
        }

        if (!formData.estimatedTime || formData.estimatedTime <= 0) {
            newErrors.estimatedTime = 'Estimated time is required and must be greater than 0';
        }

        if (!formData.description?.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.warranty.duration || formData.warranty.duration <= 0) {
            newErrors['warranty.duration'] = 'Warranty duration is required';
        }

        if (!formData.availability.canStartBy) {
            newErrors['availability.canStartBy'] = 'Start date is required';
        }

        if (!formData.modificationReason?.trim()) {
            newErrors.modificationReason = 'Please provide a reason for modification';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const payload = {
            pricing: {
                basePrice: parseFloat(formData.basePrice),
                partsEstimate: parseFloat(formData.partsEstimate) || 0,
                partsQuality: formData.partsQuality,
                currency: 'TRY'
            },
            estimatedTime: {
                value: parseInt(formData.estimatedTime),
                unit: formData.timeUnit
            },
            description: formData.description,
            warranty: {
                duration: parseInt(formData.warranty.duration),
                description: formData.warranty.description || '',
                terms: formData.warranty.terms || ''
            },
            availability: {
                canStartBy: new Date(formData.availability.canStartBy)
            },
            serviceOptions: {
                pickupAvailable: formData.serviceOptions.pickupAvailable,
                pickupCharge: formData.serviceOptions.pickupCharge || 0,
                homeService: formData.serviceOptions.homeService,
                homeServiceCharge: formData.serviceOptions.homeServiceCharge || 0
            },
            modificationReason: formData.modificationReason
        };

        onUpdate(payload);
    };

    const handleClose = () => {
        setFormData({});
        setErrors({});
        onClose();
    };

    const totalPrice = (parseFloat(formData.basePrice) || 0) + (parseFloat(formData.partsEstimate) || 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Offer</h2>
                    <button 
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Pricing Section */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-4">Pricing Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Base Price (TRY) *
                                    </label>
                                    <input
                                        type="number"
                                        name="basePrice"
                                        value={formData.basePrice}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.basePrice ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter base price"
                                        disabled={loading}
                                    />
                                    {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parts Estimate (TRY)
                                    </label>
                                    <input
                                        type="number"
                                        name="partsEstimate"
                                        value={formData.partsEstimate}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter parts estimate"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parts Quality
                                    </label>
                                    <select
                                        name="partsQuality"
                                        value={formData.partsQuality}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loading}
                                    >
                                        {partsQualityOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Price
                                    </label>
                                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-lg font-semibold">
                                        {totalPrice.toLocaleString()} TRY
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Time & Description */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estimated Time *
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        name="estimatedTime"
                                        value={formData.estimatedTime}
                                        onChange={handleInputChange}
                                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.estimatedTime ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Time"
                                        disabled={loading}
                                    />
                                    <select
                                        name="timeUnit"
                                        value={formData.timeUnit}
                                        onChange={handleInputChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loading}
                                    >
                                        {timeUnits.map(unit => (
                                            <option key={unit.value} value={unit.value}>
                                                {unit.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.estimatedTime && <p className="text-red-500 text-sm mt-1">{errors.estimatedTime}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Can Start By *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="availability.canStartBy"
                                    value={formData.availability.canStartBy}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors['availability.canStartBy'] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={loading}
                                />
                                {errors['availability.canStartBy'] && <p className="text-red-500 text-sm mt-1">{errors['availability.canStartBy']}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Describe your repair offer..."
                                disabled={loading}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Warranty */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-4">Warranty</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (Days) *
                                    </label>
                                    <input
                                        type="number"
                                        name="warranty.duration"
                                        value={formData.warranty.duration}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors['warranty.duration'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Warranty days"
                                        disabled={loading}
                                    />
                                    {errors['warranty.duration'] && <p className="text-red-500 text-sm mt-1">{errors['warranty.duration']}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Warranty Description
                                </label>
                                <textarea
                                    name="warranty.description"
                                    value={formData.warranty.description}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe warranty terms..."
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Service Options */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-4">Service Options</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="serviceOptions.pickupAvailable"
                                            checked={formData.serviceOptions.pickupAvailable}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            disabled={loading}
                                        />
                                        Pickup Available
                                    </label>
                                    {formData.serviceOptions.pickupAvailable && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Charge:</span>
                                            <input
                                                type="number"
                                                name="serviceOptions.pickupCharge"
                                                value={formData.serviceOptions.pickupCharge}
                                                onChange={handleInputChange}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                placeholder="0"
                                                disabled={loading}
                                            />
                                            <span className="text-sm text-gray-600">TRY</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="serviceOptions.homeService"
                                            checked={formData.serviceOptions.homeService}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            disabled={loading}
                                        />
                                        Home Service
                                    </label>
                                    {formData.serviceOptions.homeService && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Charge:</span>
                                            <input
                                                type="number"
                                                name="serviceOptions.homeServiceCharge"
                                                value={formData.serviceOptions.homeServiceCharge}
                                                onChange={handleInputChange}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                placeholder="0"
                                                disabled={loading}
                                            />
                                            <span className="text-sm text-gray-600">TRY</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modification Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Modification *
                            </label>
                            <textarea
                                name="modificationReason"
                                value={formData.modificationReason}
                                onChange={handleInputChange}
                                rows="3"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.modificationReason ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Why are you updating this offer?"
                                disabled={loading}
                            />
                            {errors.modificationReason && <p className="text-red-500 text-sm mt-1">{errors.modificationReason}</p>}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading && (
                            <Icon icon="eos-icons:loading" className="w-4 h-4 mr-2" />
                        )}
                        {loading ? 'Updating...' : 'Update Offer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditOfferModal;