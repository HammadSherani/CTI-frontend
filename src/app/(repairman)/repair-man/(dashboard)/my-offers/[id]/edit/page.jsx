"use client"
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

function EditOfferPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { id } = useParams();
    const router = useRouter();
    const { token } = useSelector((state) => state.auth);

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

    const fetchOfferDetails = async () => {
        try {
            const res = await axiosInstance.get(`/repairman/offers/my-offers/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
            });
            
            const offer = res.data.data;
            setData(offer);

            // Initialize form with existing data
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

            setLoading(false);
        } catch (error) {
            handleError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && token) {
            fetchOfferDetails();
        }
    }, [id, token]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setUpdating(true);

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

        try {
            const response = await axiosInstance.put(`/repairman/offers/${id}`, payload, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                // Show success message (you can add toast here)
                alert('Offer updated successfully!');
                router.back(); // Go back to previous page
            }
        } catch (error) {
            handleError(error);
        } finally {
            setUpdating(false);
        }
    };

    const totalPrice = (parseFloat(formData.basePrice) || 0) + (parseFloat(formData.partsEstimate) || 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Icon icon="eos-icons:loading" className="w-8 h-8 text-blue-600" />
                    <span className="text-lg text-gray-600">Loading offer details...</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="heroicons:exclamation-triangle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Offer Not Found</h2>
                    <p className="text-gray-600 mb-4">The offer you're looking for could not be found.</p>
                    <button 
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const jobTitle = `${data.jobId?.deviceInfo?.brand || ''} ${data.jobId?.deviceInfo?.model || ''} Repair`;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <button 
                                onClick={() => router.back()}
                                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                            >
                                <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-2" />
                                Back to Offers
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Offer</h1>
                            <p className="text-gray-600 mt-1">{jobTitle}</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                {data.status?.charAt(0).toUpperCase() + data.status?.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="space-y-8">
                        {/* Pricing Section */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Base Price (TRY) *
                                    </label>
                                    <input
                                        type="number"
                                        name="basePrice"
                                        value={formData.basePrice}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.basePrice ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter base price"
                                        disabled={updating}
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter parts estimate"
                                        disabled={updating}
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={updating}
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
                                    <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-xl font-bold text-blue-900">
                                        {totalPrice.toLocaleString()} TRY
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Time & Availability */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estimated Time *
                                </label>
                                <div className="flex space-x-3">
                                    <input
                                        type="number"
                                        name="estimatedTime"
                                        value={formData.estimatedTime}
                                        onChange={handleInputChange}
                                        className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.estimatedTime ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Time"
                                        disabled={updating}
                                    />
                                    <select
                                        name="timeUnit"
                                        value={formData.timeUnit}
                                        onChange={handleInputChange}
                                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={updating}
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
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors['availability.canStartBy'] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={updating}
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
                                rows="5"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Describe your repair offer..."
                                disabled={updating}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Warranty */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (Days) *
                                    </label>
                                    <input
                                        type="number"
                                        name="warranty.duration"
                                        value={formData.warranty.duration}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors['warranty.duration'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Warranty days"
                                        disabled={updating}
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
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe warranty terms..."
                                    disabled={updating}
                                />
                            </div>
                        </div>

                        {/* Service Options */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Options</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="serviceOptions.pickupAvailable"
                                            checked={formData.serviceOptions.pickupAvailable}
                                            onChange={handleInputChange}
                                            className="mr-3 h-5 w-5 text-blue-600"
                                            disabled={updating}
                                        />
                                        <span className="font-medium">Pickup Available</span>
                                    </label>
                                    {formData.serviceOptions.pickupAvailable && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Charge:</span>
                                            <input
                                                type="number"
                                                name="serviceOptions.pickupCharge"
                                                value={formData.serviceOptions.pickupCharge}
                                                onChange={handleInputChange}
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                placeholder="0"
                                                disabled={updating}
                                            />
                                            <span className="text-sm text-gray-600">TRY</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="serviceOptions.homeService"
                                            checked={formData.serviceOptions.homeService}
                                            onChange={handleInputChange}
                                            className="mr-3 h-5 w-5 text-blue-600"
                                            disabled={updating}
                                        />
                                        <span className="font-medium">Home Service</span>
                                    </label>
                                    {formData.serviceOptions.homeService && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Charge:</span>
                                            <input
                                                type="number"
                                                name="serviceOptions.homeServiceCharge"
                                                value={formData.serviceOptions.homeServiceCharge}
                                                onChange={handleInputChange}
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                placeholder="0"
                                                disabled={updating}
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
                                rows="4"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.modificationReason ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Why are you updating this offer?"
                                disabled={updating}
                            />
                            {errors.modificationReason && <p className="text-red-500 text-sm mt-1">{errors.modificationReason}</p>}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={updating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {updating && (
                                <Icon icon="eos-icons:loading" className="w-5 h-5 mr-2" />
                            )}
                            {updating ? 'Updating...' : 'Update Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditOfferPage;