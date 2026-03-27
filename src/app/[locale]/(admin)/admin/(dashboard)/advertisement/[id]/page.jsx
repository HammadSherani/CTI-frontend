"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';
import Link from 'next/link';

function ViewAdvertisement() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const [ad, setAd] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector((state) => state.auth);


    useEffect(() => {
        fetchAdDetails();
    }, [id]);

    const fetchAdDetails = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/admin/advertisements/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAd(data?.data);
        } catch (error) {
            handleError(error);
            setLoading(false);
            router.push('/admin/advertisement');
        }
        finally {
            setLoading(false);
        }
    };
    
    console.log('Fetched ad details:', ad);
    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'expired': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
   const getCurrencySymbol = (currency) => {
        const symbols = {
            USD: '$',
            TRY: '₺',
            PKR: '₨',
        };
        return symbols[currency] || currency;
    };

    const getRemainingDays = () => {
        if (!ad) return 0;
        const today = new Date();
        const endDate = new Date(ad.endDate);
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading advertisement details...</p>
                </div>
            </div>
        );
    }

    if (!ad) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="mdi:alert-circle" className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-gray-600">Advertisement not found</p>
                    <Link href="/admin/advertisement" className="text-primary-600 hover:underline mt-4 inline-block">
                        Back to Ads
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                title="Go back"
                            >
                                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Advertisement Details</h1>
                                <p className="text-gray-600 mt-1">View complete information about this advertisement</p>
                            </div>
                        </div>
                     
                    </div>
                </div>

                

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Ad Details */}
                        {ad.type === 'service' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Icon icon="mdi:briefcase" className="w-6 h-6 mr-2 text-primary-600" />
                                    Service Advertisement
                                </h2>
                                
                                {/* Image */}
                                <div className="mb-6">
                                    <img
                                        src={ad.image}
                                        alt={ad.title}
                                        className="w-full h-96 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                </div>

                                {/* Title */}
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-500">Title</label>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{ad.title}</h3>
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="text-gray-700 mt-2 leading-relaxed">{ad.description}</p>
                                </div>

                                {/* City */}
                                <div className="flex items-center text-gray-600">
                                    <Icon icon="mdi:map-marker" className="w-5 h-5 mr-2 text-primary-600" />
                                    <span className="font-medium">{ad.city?.name}</span>
                                </div>
                            </div>
                        )}

                        {/* Service List - Only for Service Type Ads */}
                        {ad.type === 'service' && ad.serviceList && ad.serviceList.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Icon icon="mdi:format-list-bulleted" className="w-6 h-6 mr-2 text-primary-600" />
                                    Service List ({ad.serviceList.length})
                                </h2>
                                
                                <div className="space-y-4">
                                    {ad.serviceList.map((service, index) => (
                                        <div 
                                            key={service._id || index} 
                                            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50"
                                        >
                                            {/* Service Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{service.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            service.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {service.status}
                                                        </span>
                                                        {service.isActive && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                <Icon icon="mdi:check-circle" className="w-3 h-3 mr-1" />
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-primary-600">
                                                        {getCurrencySymbol(service.pricing?.currency || ad.currency)}
                                                        {service.pricing?.total?.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Total Price</div>
                                                </div>
                                            </div>

                                            {/* Service Description */}
                                            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                                                {service.description}
                                            </p>

                                            {/* Device Info & Pricing Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                                {/* Device Information */}
                                                {service.deviceInfo && (
                                                    <div className="bg-blue-50 rounded-lg p-3">
                                                        <div className="flex items-center mb-2">
                                                            <Icon icon="mdi:cellphone" className="w-5 h-5 text-blue-600 mr-2" />
                                                            <span className="text-sm font-semibold text-gray-900">Device Info</span>
                                                        </div>
                                                        <div className="space-y-1 text-sm">
                                                            {service.deviceInfo.brandId && (
                                                                <div className="flex items-center text-gray-700">
                                                                    <Icon icon="mdi:tag" className="w-4 h-4 mr-1" />
                                                                    <span className="font-medium">Brand:</span>
                                                                    <span className="ml-1">{service.deviceInfo.brandId}</span>
                                                                </div>
                                                            )}
                                                            {service.deviceInfo.modelId && (
                                                                <div className="flex items-center text-gray-700">
                                                                    <Icon icon="mdi:information" className="w-4 h-4 mr-1" />
                                                                    <span className="font-medium">Model:</span>
                                                                    <span className="ml-1">{service.deviceInfo.modelId}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Pricing Breakdown */}
                                                {service.pricing && (
                                                    <div className="bg-green-50 rounded-lg p-3">
                                                        <div className="flex items-center mb-2">
                                                            <Icon icon="mdi:currency-usd" className="w-5 h-5 text-green-600 mr-2" />
                                                            <span className="text-sm font-semibold text-gray-900">Pricing Details</span>
                                                        </div>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between text-gray-700">
                                                                <span>Base Price:</span>
                                                                <span className="font-medium">
                                                                    {getCurrencySymbol(service.pricing.currency || ad.currency)}
                                                                    {service.pricing.basePrice?.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-gray-700">
                                                                <span>Parts Price:</span>
                                                                <span className="font-medium">
                                                                    {getCurrencySymbol(service.pricing.currency || ad.currency)}
                                                                    {service.pricing.partsPrice?.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {service.pricing.serviceCharges > 0 && (
                                                                <div className="flex justify-between text-gray-700">
                                                                    <span>Service Charges:</span>
                                                                    <span className="font-medium">
                                                                        {getCurrencySymbol(service.pricing.currency || ad.currency)}
                                                                        {service.pricing.serviceCharges?.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between text-gray-900 font-bold pt-1 border-t border-green-200">
                                                                <span>Total:</span>
                                                                <span>
                                                                    {getCurrencySymbol(service.pricing.currency || ad.currency)}
                                                                    {service.pricing.total?.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Service Dates */}
                                            {(service.createdAt || service.updatedAt) && (
                                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
                                                    {service.createdAt && (
                                                        <div className="flex items-center">
                                                            <Icon icon="mdi:calendar-plus" className="w-4 h-4 mr-1" />
                                                            Created: {formatDate(service.createdAt).split(',')[0]}
                                                        </div>
                                                    )}
                                                    {service.updatedAt && service.updatedAt !== service.createdAt && (
                                                        <div className="flex items-center">
                                                            <Icon icon="mdi:calendar-edit" className="w-4 h-4 mr-1" />
                                                            Updated: {formatDate(service.updatedAt).split(',')[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Profile Ad Details */}
                      {/* Profile Ad Details */}
{ad.type === 'profile' && (
    <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:account" className="w-6 h-6 mr-2 text-primary-600" />
            Profile Advertisement
        </h2>
        
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
            {ad.user_id?.repairmanProfile?.profilePhoto ? (
                <img
                    src={ad.user_id.repairmanProfile.profilePhoto}
                    alt={ad.user_id?.repairmanProfile?.fullName || ad.user_id?.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
            ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                    <Icon icon="mdi:account" className="w-12 h-12 text-primary-600" />
                </div>
            )}
            <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                    {ad.user_id?.repairmanProfile?.fullName || ad.user_id?.name || 'N/A'}
                </h3>
                <p className="text-gray-600">{ad.user_id?.repairmanProfile?.shopName || 'N/A'}</p>
                <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center">
                        <Icon icon="mdi:star" className="w-5 h-5 text-yellow-500 mr-1" />
                        <span className="font-semibold">{ad.user_id?.repairmanProfile?.rating || 0}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Icon icon="mdi:briefcase" className="w-5 h-5 mr-1" />
                        <span>{ad.user_id?.repairmanProfile?.totalJobs || 0} Jobs</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Icon icon="mdi:clock" className="w-5 h-5 mr-1" />
                        <span>{ad.user_id?.repairmanProfile?.yearsOfExperience || 0} Years</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 mt-1">{ad.user_id?.repairmanProfile?.emailAddress || ad.user_id?.email || 'N/A'}</p>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900 mt-1">{ad.user_id?.repairmanProfile?.mobileNumber || ad.user_id?.phone || 'N/A'}</p>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                <p className="text-gray-900 mt-1">{ad.user_id?.repairmanProfile?.whatsappNumber || 'N/A'}</p>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-500">City</label>
                <p className="text-gray-900 mt-1">{ad.user_id?.city?.name || ad.user_id?.repairmanProfile?.city || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900 mt-1">{ad.user_id?.address || ad.user_id?.repairmanProfile?.fullAddress || 'N/A'}</p>
            </div>
        </div>

        {/* Description */}
        {ad.user_id?.repairmanProfile?.description && (
            <div className="mb-6">
                <label className="text-sm font-medium text-gray-500">About</label>
                <p className="text-gray-700 mt-2 leading-relaxed">
                    {ad.user_id.repairmanProfile.description}
                </p>
            </div>
        )}

        {/* Specializations */}
        {ad.user_id?.repairmanProfile?.specializations && ad.user_id.repairmanProfile.specializations.length > 0 && (
            <div className="mb-6">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Specializations</label>
                <div className="flex flex-wrap gap-2">
                    {ad.user_id.repairmanProfile.specializations.map((spec, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {spec}
                        </span>
                    ))}
                </div>
            </div>
        )}

        {/* Working Hours & Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {ad.user_id?.repairmanProfile?.workingHours && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Working Hours</label>
                    <div className="flex items-center text-gray-900">
                        <Icon icon="mdi:clock-outline" className="w-5 h-5 mr-2 text-primary-600" />
                        <span>
                            {ad.user_id.repairmanProfile.workingHours.start} - {ad.user_id.repairmanProfile.workingHours.end}
                        </span>
                    </div>
                </div>
            )}
            
            {ad.user_id?.repairmanProfile?.workingDays && ad.user_id.repairmanProfile.workingDays.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Working Days</label>
                    <div className="flex flex-wrap gap-1">
                        {ad.user_id.repairmanProfile.workingDays.map((day, index) => (
                            <span key={index} className="px-2 py-0.5 bg-white text-gray-700 rounded text-xs border border-gray-200">
                                {day.substring(0, 3)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* KYC Status */}
        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
            <Icon icon="mdi:shield-check" className="w-6 h-6 text-green-600" />
            <div>
                <p className="text-sm font-medium text-gray-900">KYC Status</p>
                <p className="text-sm text-green-700">
                    {ad.user_id?.repairmanProfile?.kycStatus === 'approved' ? 'Verified' : ad.user_id?.repairmanProfile?.kycStatus || 'Pending'}
                </p>
            </div>
        </div>
    </div>
)}

                        {/* Performance Metrics */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Icon icon="mdi:chart-bar" className="w-6 h-6 mr-2 text-primary-600" />
                                Performance Metrics
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <Icon icon="mdi:eye" className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{ad.views || 0}</p>
                                    <p className="text-sm text-gray-600">Views</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                    <Icon icon="mdi:cursor-pointer" className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{ad.clicks || 0}</p>
                                    <p className="text-sm text-gray-600">Clicks</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg text-center">
                                    <Icon icon="mdi:percent" className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">
                                        {ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : 0}%
                                    </p>
                                    <p className="text-sm text-gray-600">AUDEINCE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        {/* Advertisement Type */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ad Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Type</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            ad.type === 'service' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            <Icon 
                                                icon={ad.type === 'service' ? 'mdi:briefcase' : 'mdi:account'} 
                                                className="w-4 h-4 mr-1" 
                                            />
                                            {ad.type === 'service' ? 'Service' : 'Profile'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ad.status)}`}>
                                            {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Ad ID</label>
                                    <p className="text-gray-900 mt-1 font-mono text-sm">{ad._id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Duration & Pricing */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Duration & Pricing</h3>
                            <div className="space-y-4">
                                   <div className="bg-primary-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Total Cost</span>
                                        <span className="text-2xl font-bold text-primary-600">
                                            {getCurrencySymbol(ad?.budget.currencyCode)}{ad.budget?.totalPrice}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {getCurrencySymbol(ad.budget.currencyCode)}{(ad.budget?.totalPrice / ad.duration?.totalDays).toFixed(2)} per day
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Duration</label>
                                    <p className="text-gray-900 mt-1 font-semibold flex items-center">
                                        <Icon icon="mdi:calendar-clock" className="w-5 h-5 mr-2 text-primary-600" />
                                        {ad.duration?.totalDays} Days
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                                    <p className="text-gray-900 mt-1">{formatDate(ad.duration?.startDate).split(',')[0]}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">End Date</label>
                                    <p className="text-gray-900 mt-1">{formatDate(ad.duration?.endDate).split(',')[0]}</p>
                                </div>

                                {ad.status === 'approved' && (
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-green-700 font-medium">Days Remaining</span>
                                            <span className="text-xl font-bold text-green-600">{getRemainingDays()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <Icon icon="mdi:calendar-plus" className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Created</p>
                                        <p className="text-sm text-gray-900">{formatDate(ad.createdAt)}</p>
                                    </div>
                                </div>

                                {ad.updatedAt !== ad.createdAt && (
                                    <div className="flex items-start">
                                        <Icon icon="mdi:calendar-edit" className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                            <p className="text-sm text-gray-900">{formatDate(ad.updatedAt)}</p>
                                        </div>
                                    </div>
                                )}

                                {ad.approvedAt && (
                                    <div className="flex items-start">
                                        <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Approved</p>
                                            <p className="text-sm text-gray-900">{formatDate(ad.approvedAt)}</p>
                                        </div>
                                    </div>
                                )}

                                {ad.rejectedAt && (
                                    <div className="flex items-start">
                                        <Icon icon="mdi:close-circle" className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Rejected</p>
                                            <p className="text-sm text-gray-900">{formatDate(ad.rejectedAt)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewAdvertisement;
