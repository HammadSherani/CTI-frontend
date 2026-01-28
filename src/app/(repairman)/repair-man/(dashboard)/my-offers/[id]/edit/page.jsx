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
        // Pricing
        basePrice: '',
        partsEstimate: '',
        partsQuality: 'original',
        
        // Time
        estimatedTime: '',
        timeUnit: 'days',
        
        // Description
        description: '',
        
        // Warranty
        warranty: {
            duration: '',
            description: '',
            terms: ''
        },
        
        // Availability
        availability: {
            canStartBy: ''
        },
        
        // Service Options
        serviceOptions: {
            pickupAvailable: false,
            pickupCharge: 0,
            dropOffLocation: '',
            homeService: false,
            homeServiceCharge: 0
        },
        
        // Experience
        experience: {
            similarRepairs: 0,
            successRate: 95
        },
        
        // Required Parts (if needed to update)
        isPartRequired: false,
        requiredParts: [],
        
        // Modification Reason
        modificationReason: ''
    });

    const [errors, setErrors] = useState({});

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
            
            const offer = res.data.data.offer;
            setData(offer);

            // Initialize form with existing data
            setFormData({
                basePrice: offer.pricing?.basePrice?.toString() || '',
                partsEstimate: offer.pricing?.partsEstimate?.toString() || '0',
                partsQuality: offer.pricing?.partsQuality || 'original',
                estimatedTime: offer.estimatedTime?.value?.toString() || '',
                timeUnit: offer.estimatedTime?.unit || 'days',
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
                    dropOffLocation: offer.serviceOptions?.dropOffLocation || '',
                    homeService: offer.serviceOptions?.homeService || false,
                    homeServiceCharge: offer.serviceOptions?.homeServiceCharge || 0
                },
                experience: {
                    similarRepairs: offer.experience?.similarRepairs || 0,
                    successRate: offer.experience?.successRate || 95
                },
                isPartRequired: offer.isPartRequired || false,
                requiredParts: offer.requiredParts || [],
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

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
            newErrors.basePrice = 'Base price must be greater than 0';
        }
        if (!formData.estimatedTime || parseInt(formData.estimatedTime) <= 0) {
            newErrors.estimatedTime = 'Estimated time must be greater than 0';
        }
        if (!formData.description?.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!formData.warranty.duration || parseInt(formData.warranty.duration) <= 0) {
            newErrors['warranty.duration'] = 'Warranty duration must be greater than 0';
        }
        if (!formData.availability.canStartBy) {
            newErrors['availability.canStartBy'] = 'Start date is required';
        }
        if (!formData.modificationReason?.trim()) {
            newErrors.modificationReason = 'Please provide a reason for modification';
        }
        
        // Validate experience
        if (formData.experience.successRate < 0 || formData.experience.successRate > 100) {
            newErrors['experience.successRate'] = 'Success rate must be between 0 and 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

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
            description: formData.description.trim(),
            warranty: {
                duration: parseInt(formData.warranty.duration),
                description: formData.warranty.description?.trim() || '',
                terms: formData.warranty.terms?.trim() || ''
            },
            availability: {
                canStartBy: new Date(formData.availability.canStartBy).toISOString()
            },
            serviceOptions: {
                pickupAvailable: formData.serviceOptions.pickupAvailable,
                pickupCharge: parseFloat(formData.serviceOptions.pickupCharge) || 0,
                dropOffLocation: formData.serviceOptions.dropOffLocation?.trim() || '',
                homeService: formData.serviceOptions.homeService,
                homeServiceCharge: parseFloat(formData.serviceOptions.homeServiceCharge) || 0
            },
            experience: {
                similarRepairs: parseInt(formData.experience.similarRepairs) || 0,
                successRate: parseFloat(formData.experience.successRate) || 95
            },
            isPartRequired: formData.isPartRequired,
            requiredParts: formData.requiredParts,
            modificationReason: formData.modificationReason.trim()
        };

        try {
            const response = await axiosInstance.put(`/repairman/offers/${id}`, payload, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                alert('✅ Offer updated successfully!');
                router.back();
            }
        } catch (error) {
            handleError(error);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setUpdating(false);
        }
    };

    const totalPrice = (parseFloat(formData.basePrice) || 0) + (parseFloat(formData.partsEstimate) || 0);
    const totalWithServices = totalPrice + 
        (formData.serviceOptions.pickupAvailable ? parseFloat(formData.serviceOptions.pickupCharge) || 0 : 0) +
        (formData.serviceOptions.homeService ? parseFloat(formData.serviceOptions.homeServiceCharge) || 0 : 0);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Icon icon="eos-icons:loading" className="w-12 h-12 text-primary-600 animate-spin" />
                    <span className="text-lg text-gray-600 font-medium">Loading offer details...</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="heroicons:exclamation-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Offer Not Found</h2>
                    <button onClick={() => router.back()} className="text-primary-600 hover:text-primary-700 font-medium">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <button 
                                onClick={() => router.back()} 
                                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                            >
                                <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium">Back</span>
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Offer</h1>
                            <p className="text-gray-600">
                                Device: <span className="font-semibold text-gray-800">
                                    {data.jobDetails?.deviceInfo?.brand} {data.jobDetails?.deviceInfo?.model}
                                </span> ({data.jobDetails?.deviceInfo?.color})
                            </p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase ${
                                data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                data.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                data.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                                {data.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-2">Offer ID: {data._id.slice(-8)}</p>
                        </div>
                    </div>
                </div>

                {/* Error Summary */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm">
                        <div className="flex items-start">
                            <Icon icon="heroicons:exclamation-triangle" className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-red-800 font-bold mb-1">Please fix the following errors:</h3>
                                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current vs New Comparison */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <Icon icon="heroicons:arrows-right-left" className="w-6 h-6 mr-2" />
                        Price Comparison
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                            <p className="text-sm opacity-90 mb-1">Current Total</p>
                            <p className="text-2xl font-bold">{data.pricing?.totalPrice?.toLocaleString()} TRY</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                            <p className="text-sm opacity-90 mb-1">New Total (Base + Parts)</p>
                            <p className="text-2xl font-bold">{totalPrice.toLocaleString()} TRY</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                            <p className="text-sm opacity-90 mb-1">With All Services</p>
                            <p className="text-2xl font-bold">{totalWithServices.toLocaleString()} TRY</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Pricing Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Icon icon="heroicons:currency-dollar" className="w-6 h-6 mr-2 text-primary-600" />
                            Pricing Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Base Labor Price (TRY) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="basePrice"
                                    value={formData.basePrice}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 transition ${
                                        errors.basePrice ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={updating}
                                    placeholder="e.g., 6000"
                                />
                                {errors.basePrice && (
                                    <p className="text-red-600 text-xs mt-1 font-semibold flex items-center">
                                        <Icon icon="heroicons:x-circle" className="w-4 h-4 mr-1" />
                                        {errors.basePrice}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Parts Estimate (TRY)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="partsEstimate"
                                    value={formData.partsEstimate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition"
                                    disabled={updating}
                                    placeholder="e.g., 3000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Parts Quality
                                </label>
                                <select
                                    name="partsQuality"
                                    value={formData.partsQuality}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    disabled={updating}
                                >
                                    {partsQualityOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    New Total Quote
                                </label>
                                <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                                    <p className="text-3xl font-bold text-green-700">
                                        {totalPrice.toLocaleString()} TRY
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time and Availability */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Icon icon="heroicons:clock" className="w-6 h-6 mr-2 text-blue-600" />
                            Schedule & Availability
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Estimated Duration *
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        name="estimatedTime"
                                        value={formData.estimatedTime}
                                        onChange={handleInputChange}
                                        className={`w-2/3 px-4 py-3 border-2 rounded-lg transition ${
                                            errors.estimatedTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={updating}
                                        placeholder="e.g., 20"
                                    />
                                    <select
                                        name="timeUnit"
                                        value={formData.timeUnit}
                                        onChange={handleInputChange}
                                        className="w-1/3 px-4 py-3 border-2 border-gray-300 rounded-lg"
                                        disabled={updating}
                                    >
                                        {timeUnits.map(u => (
                                            <option key={u.value} value={u.value}>{u.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.estimatedTime && (
                                    <p className="text-red-600 text-xs mt-1 font-semibold flex items-center">
                                        <Icon icon="heroicons:x-circle" className="w-4 h-4 mr-1" />
                                        {errors.estimatedTime}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Earliest Start Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="availability.canStartBy"
                                    value={formData.availability.canStartBy}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-lg transition ${
                                        errors['availability.canStartBy'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={updating}
                                />
                                {errors['availability.canStartBy'] && (
                                    <p className="text-red-600 text-xs mt-1 font-semibold flex items-center">
                                        <Icon icon="heroicons:x-circle" className="w-4 h-4 mr-1" />
                                        {errors['availability.canStartBy']}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                            <Icon icon="heroicons:document-text" className="w-5 h-5 mr-2 text-purple-600" />
                            Offer Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="5"
                            className={`w-full px-4 py-3 border-2 rounded-lg transition ${
                                errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Detail what is included in your repair service, your approach, and what the customer can expect..."
                            disabled={updating}
                        />
                        <div className="flex justify-between items-center mt-2">
                            {errors.description && (
                                <p className="text-red-600 text-xs font-semibold flex items-center">
                                    <Icon icon="heroicons:x-circle" className="w-4 h-4 mr-1" />
                                    {errors.description}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 ml-auto">
                                {formData.description.length} characters
                            </p>
                        </div>
                    </div>

                    {/* Warranty Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Icon icon="heroicons:shield-check" className="w-6 h-6 mr-2 text-green-600" />
                            Warranty Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Warranty Duration (days) *
                                </label>
                                <input
                                    type="number"
                                    name="warranty.duration"
                                    value={formData.warranty.duration}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-lg transition ${
                                        errors['warranty.duration'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={updating}
                                    placeholder="e.g., 30"
                                />
                                {errors['warranty.duration'] && (
                                    <p className="text-red-600 text-xs mt-1 font-semibold flex items-center">
                                        <Icon icon="heroicons:x-circle" className="w-4 h-4 mr-1" />
                                        {errors['warranty.duration']}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Warranty Description
                                </label>
                                <textarea
                                    name="warranty.description"
                                    value={formData.warranty.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                                    placeholder="What does your warranty cover? (e.g., parts replacement, labor, etc.)"
                                    disabled={updating}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Warranty Terms & Conditions
                                </label>
                                <textarea
                                    name="warranty.terms"
                                    value={formData.warranty.terms}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                                    placeholder="Any specific terms, conditions, or exclusions..."
                                    disabled={updating}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Options */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Icon icon="heroicons:truck" className="w-6 h-6 mr-2 text-orange-600" />
                            Service Options & Logistics
                        </h3>
                        <div className="space-y-4">
                            {/* Pickup & Delivery */}
                            <div className="border-2 border-gray-200 rounded-lg p-5 hover:border-primary-300 transition">
                                <label className="flex items-center cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        name="serviceOptions.pickupAvailable"
                                        checked={formData.serviceOptions.pickupAvailable}
                                        onChange={handleInputChange}
                                        className="h-6 w-6 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                        disabled={updating}
                                    />
                                    <div className="ml-3">
                                        <span className="font-bold text-gray-900 text-lg">Pickup & Delivery Service</span>
                                        <p className="text-sm text-gray-600">Collect device from customer and deliver after repair</p>
                                    </div>
                                </label>
                                
                                {formData.serviceOptions.pickupAvailable && (
                                    <div className="space-y-3 pl-9 border-t pt-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Pickup & Delivery Charge (TRY)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="serviceOptions.pickupCharge"
                                                value={formData.serviceOptions.pickupCharge}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                                                placeholder="e.g., 2000"
                                                disabled={updating}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Drop-off Location Address
                                            </label>
                                            <textarea
                                                name="serviceOptions.dropOffLocation"
                                                value={formData.serviceOptions.dropOffLocation}
                                                onChange={handleInputChange}
                                                rows="2"
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                                                placeholder="Enter your workshop/shop address for drop-off..."
                                                disabled={updating}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Home Service */}
                            <div className="border-2 border-gray-200 rounded-lg p-5 hover:border-primary-300 transition">
                                <label className="flex items-center cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        name="serviceOptions.homeService"
                                        checked={formData.serviceOptions.homeService}
                                        onChange={handleInputChange}
                                        className="h-6 w-6 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                        disabled={updating}
                                    />
                                    <div className="ml-3">
                                        <span className="font-bold text-gray-900 text-lg">On-Site Home Service</span>
                                        <p className="text-sm text-gray-600">Repair at customer's location</p>
                                    </div>
                                </label>
                                
                                {formData.serviceOptions.homeService && (
                                    <div className="pl-9 border-t pt-4">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Home Service Charge (TRY)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="serviceOptions.homeServiceCharge"
                                            value={formData.serviceOptions.homeServiceCharge}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                                            placeholder="e.g., 1500"
                                            disabled={updating}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Experience Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Icon icon="heroicons:star" className="w-6 h-6 mr-2 text-indigo-600" />
                            Your Experience & Track Record
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Similar Repairs Completed
                                </label>
                                <input
                                    type="number"
                                    name="experience.similarRepairs"
                                    value={formData.experience.similarRepairs}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                                    disabled={updating}
                                    placeholder="e.g., 150"
                                />
                                <p className="text-xs text-gray-500 mt-1">Number of similar repairs you've done</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Success Rate (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    name="experience.successRate"
                                    value={formData.experience.successRate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-lg ${
                                        errors['experience.successRate'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={updating}
                                    placeholder="e.g., 95"
                                />
                                {errors['experience.successRate'] && (
                                    <p className="text-red-600 text-xs mt-1 font-semibold">
                                        {errors['experience.successRate']}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Your overall success rate (0-100%)</p>
                            </div>
                        </div>
                    </div>

                    {/* Parts Required Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-cyan-500">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Icon icon="heroicons:wrench-screwdriver" className="w-6 h-6 mr-2 text-cyan-600" />
                            Parts Requirements
                        </h3>
                        <label className="flex items-center cursor-pointer mb-4">
                            <input
                                type="checkbox"
                                name="isPartRequired"
                                checked={formData.isPartRequired}
                                onChange={handleInputChange}
                                className="h-6 w-6 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                disabled={updating}
                            />
                            <span className="ml-3 font-bold text-gray-900">Parts are required for this repair</span>
                        </label>

                        {formData.isPartRequired && data.requiredParts && data.requiredParts.length > 0 && (
                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mt-4">
                                <h4 className="font-bold text-cyan-900 mb-3">Required Parts:</h4>
                                {data.requiredParts.map((part, index) => (
                                    <div key={part._id || index} className="bg-white rounded-lg p-3 mb-2 border border-cyan-200">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-900">{part.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    Brand: {part.brand?.name} | Model: {part.model?.name}
                                                </p>
                                            </div>
                                            <p className="font-bold text-cyan-900">
                                                {part.price?.toLocaleString()} TRY
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modification Reason - CRITICAL */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 border-4 border-red-400 rounded-xl shadow-lg p-6">
                        <div className="flex items-start mb-4">
                            <div className="bg-red-500 rounded-full p-2 mr-3">
                                <Icon icon="heroicons:exclamation-triangle" className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-red-900 mb-1">
                                    Modification Reason Required *
                                </h3>
                                <p className="text-sm text-red-700">
                                    Please explain why you're modifying this offer. This helps build trust with the customer.
                                </p>
                            </div>
                        </div>
                        <textarea
                            name="modificationReason"
                            value={formData.modificationReason}
                            onChange={handleInputChange}
                            rows="5"
                            className={`w-full px-4 py-3 border-3 rounded-lg focus:ring-4 focus:ring-red-500 transition ${
                                errors.modificationReason ? 'border-red-600 bg-red-100' : 'border-red-300 bg-white'
                            }`}
                            placeholder="Examples:&#10;• Updated pricing due to parts availability check&#10;• Adjusted timeline based on current workload&#10;• Changed service options to better meet customer needs&#10;• Corrected initial estimate after reviewing requirements"
                            disabled={updating}
                        />
                        {errors.modificationReason && (
                            <div className="flex items-center mt-2 bg-red-100 border border-red-400 rounded p-2">
                                <Icon icon="heroicons:x-circle" className="w-5 h-5 text-red-700 mr-2 flex-shrink-0" />
                                <p className="text-red-800 text-sm font-bold">{errors.modificationReason}</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="sticky bottom-4 bg-white rounded-xl shadow-2xl p-4 border-2 border-gray-200">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                disabled={updating}
                                className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all shadow-md disabled:opacity-50 flex items-center justify-center"
                            >
                                <Icon icon="heroicons:x-mark" className="w-6 h-6 mr-2" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updating}
                                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold text-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updating ? (
                                    <>
                                        <Icon icon="eos-icons:loading" className="w-6 h-6 animate-spin" />
                                        <span>Updating Offer...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="heroicons:check-circle" className="w-6 h-6" />
                                        <span>Save & Update Offer</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
                    <p className="font-mono">Offer ID: {data._id}</p>
                    <p>Created: {formatDate(data.createdAt)}</p>
                    <p>Last Updated: {formatDate(data.updatedAt)}</p>
                    {data.modifications && data.modifications.count > 0 && (
                        <p className="text-orange-600 font-semibold">
                            Modified {data.modifications.count} time(s)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditOfferPage;