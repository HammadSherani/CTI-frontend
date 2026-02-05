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
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector((state) => state.auth);

    // Static data for demonstration
    const staticAds = [
        {
            _id: '1',
            type: 'service',
            title: 'Professional iPhone Screen Repair',
            description: 'Expert iPhone screen repair service with genuine parts and 6 months warranty. Fast turnaround time. We use only original and high-quality replacement parts to ensure your device works like new. Our experienced technicians have repaired over 1000+ devices.',
            image: 'https://images.unsplash.com/photo-1621768216002-5ac171876625?w=800',
            city: { _id: '1', name: 'Karachi' },
            status: 'approved',
            totalDays: 30,
            startDate: '2026-02-01',
            endDate: '2026-03-03',
            currency: 'USD',
            total: 30,
            createdAt: '2026-01-28T10:00:00.000Z',
            updatedAt: '2026-01-28T10:00:00.000Z',
            views: 245,
            clicks: 67,
            approvedAt: '2026-01-29T14:30:00.000Z',
            approvedBy: {
                name: 'Admin User',
                email: 'admin@example.com'
            }
        },
        {
            _id: '2',
            type: 'profile',
            profileId: {
                _id: '692a33bab9c59b58cd33b0bb',
                name: 'Hammad',
                email: 'hammadsherani@gmail.com',
                phone: '03347364260',
                repairmanProfile: {
                    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                    shopName: 'Hammad Tech Solutions',
                    fullAddress: '123 Main Street, Block A',
                    city: 'Karachi',
                    rating: 4.8,
                    totalJobs: 156,
                    yearsOfExperience: 5,
                    specializations: ['Mobile Phone Repair', 'Tablet Repair', 'Laptop Repair'],
                    description: 'Professional repair service with 5+ years experience in mobile and computer repairs. Specialized in iPhone, Samsung, and laptop repairs.'
                }
            },
            status: 'pending',
            totalDays: 15,
            startDate: '2026-02-05',
            endDate: '2026-02-20',
            currency: 'PKR',
            total: 4200,
            createdAt: '2026-02-03T14:30:00.000Z',
            updatedAt: '2026-02-03T14:30:00.000Z',
            views: 89,
            clicks: 23
        },
        {
            _id: '3',
            type: 'service',
            title: 'Samsung Galaxy Repair Services',
            description: 'Complete Samsung repair solutions including screen, battery, and motherboard repairs.',
            image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
            city: { _id: '2', name: 'Lahore' },
            status: 'rejected',
            totalDays: 7,
            startDate: '2026-01-20',
            endDate: '2026-01-27',
            currency: 'USD',
            total: 7,
            createdAt: '2026-01-18T08:15:00.000Z',
            updatedAt: '2026-01-19T10:20:00.000Z',
            views: 12,
            clicks: 2,
            rejectionReason: 'Image quality does not meet requirements. Please upload a higher resolution image.',
            rejectedAt: '2026-01-19T10:20:00.000Z',
            rejectedBy: {
                name: 'Admin User',
                email: 'admin@example.com'
            }
        },
        {
            _id: '4',
            type: 'service',
            title: 'Laptop Screen Replacement Expert',
            description: 'Professional laptop screen replacement service for all major brands. Quick service guaranteed.',
            image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800',
            city: { _id: '3', name: 'Islamabad' },
            status: 'approved',
            totalDays: 60,
            startDate: '2026-01-15',
            endDate: '2026-03-16',
            currency: 'EUR',
            total: 55.2,
            createdAt: '2026-01-12T16:45:00.000Z',
            updatedAt: '2026-01-13T09:30:00.000Z',
            views: 412,
            clicks: 98,
            approvedAt: '2026-01-13T09:30:00.000Z',
            approvedBy: {
                name: 'Admin User',
                email: 'admin@example.com'
            }
        },
        {
            _id: '5',
            type: 'profile',
            profileId: {
                _id: '692a33bab9c59b58cd33b0bc',
                name: 'Ali Khan',
                email: 'ali.khan@example.com',
                phone: '03001234567',
                repairmanProfile: {
                    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                    shopName: 'Ali Mobile Repairs',
                    fullAddress: '456 Commercial Area, Block B',
                    city: 'Karachi',
                    rating: 4.5,
                    totalJobs: 98,
                    yearsOfExperience: 3,
                    specializations: ['Mobile Phone Repair', 'Screen Replacement'],
                    description: 'Fast and reliable mobile repair services. We repair all brands of smartphones and tablets.'
                }
            },
            status: 'pending',
            totalDays: 45,
            startDate: '2026-02-10',
            endDate: '2026-03-27',
            currency: 'PKR',
            total: 12600,
            createdAt: '2026-02-04T11:20:00.000Z',
            updatedAt: '2026-02-04T11:20:00.000Z',
            views: 56,
            clicks: 14
        }
    ];

    useEffect(() => {
        fetchAdDetails();
    }, [id]);

    const fetchAdDetails = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // const { data } = await axiosInstance.get(`/advertisement/${id}`, {
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });
            
            // For now, using static data
            setTimeout(() => {
                const foundAd = staticAds.find(ad => ad._id === id);
                if (foundAd) {
                    setAd(foundAd);
                } else {
                    toast.error('Advertisement not found');
                    router.push('/repair-man/ads');
                }
                setLoading(false);
            }, 500);
            
        } catch (error) {
            handleError(error);
            setLoading(false);
            router.push('/repair-man/ads');
        }
    };

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
            EUR: '€',
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
                    <Link href="/repair-man/ads" className="text-primary-600 hover:underline mt-4 inline-block">
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
                        <div className="flex gap-3">
                            {ad.status !== 'approved' && (
                                <Link
                                    href={`/repair-man/ads/edit/${ad._id}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Icon icon="mdi:pencil" className="w-5 h-5" />
                                    Edit
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Banner */}
                <div className={`rounded-lg p-4 mb-6 ${
                    ad.status === 'approved' ? 'bg-green-50 border-l-4 border-green-500' :
                    ad.status === 'pending' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                    'bg-red-50 border-l-4 border-red-500'
                }`}>
                    <div className="flex items-center">
                        <Icon 
                            icon={
                                ad.status === 'approved' ? 'mdi:check-circle' :
                                ad.status === 'pending' ? 'mdi:clock-outline' :
                                'mdi:close-circle'
                            } 
                            className={`w-6 h-6 mr-3 ${
                                ad.status === 'approved' ? 'text-green-600' :
                                ad.status === 'pending' ? 'text-yellow-600' :
                                'text-red-600'
                            }`}
                        />
                        <div className="flex-1">
                            <h3 className={`font-semibold ${
                                ad.status === 'approved' ? 'text-green-900' :
                                ad.status === 'pending' ? 'text-yellow-900' :
                                'text-red-900'
                            }`}>
                                {ad.status === 'approved' ? 'Advertisement Approved' :
                                 ad.status === 'pending' ? 'Pending Review' :
                                 'Advertisement Rejected'}
                            </h3>
                            <p className={`text-sm ${
                                ad.status === 'approved' ? 'text-green-700' :
                                ad.status === 'pending' ? 'text-yellow-700' :
                                'text-red-700'
                            }`}>
                                {ad.status === 'approved' ? `Approved on ${formatDate(ad.approvedAt)} by ${ad.approvedBy?.name}` :
                                 ad.status === 'pending' ? 'Your advertisement is under review. You will be notified once it is approved.' :
                                 `Rejected on ${formatDate(ad.rejectedAt)} by ${ad.rejectedBy?.name}`}
                            </p>
                            {ad.status === 'rejected' && ad.rejectionReason && (
                                <p className="text-sm text-red-800 mt-2 font-medium">
                                    Reason: {ad.rejectionReason}
                                </p>
                            )}
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

                        {/* Profile Ad Details */}
                        {ad.type === 'profile' && ad.profileId && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Icon icon="mdi:account" className="w-6 h-6 mr-2 text-primary-600" />
                                    Profile Advertisement
                                </h2>
                                
                                {/* Profile Header */}
                                <div className="flex items-center gap-6 mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
                                    {ad.profileId.repairmanProfile?.profilePhoto ? (
                                        <img
                                            src={ad.profileId.repairmanProfile.profilePhoto}
                                            alt={ad.profileId.name}
                                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                                            <Icon icon="mdi:account" className="w-12 h-12 text-primary-600" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900">{ad.profileId.name}</h3>
                                        <p className="text-gray-600">{ad.profileId.repairmanProfile?.shopName}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center">
                                                <Icon icon="mdi:star" className="w-5 h-5 text-yellow-500 mr-1" />
                                                <span className="font-semibold">{ad.profileId.repairmanProfile?.rating}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Icon icon="mdi:briefcase" className="w-5 h-5 mr-1" />
                                                <span>{ad.profileId.repairmanProfile?.totalJobs} Jobs</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Icon icon="mdi:clock" className="w-5 h-5 mr-1" />
                                                <span>{ad.profileId.repairmanProfile?.yearsOfExperience} Years</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-gray-900 mt-1">{ad.profileId.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                        <p className="text-gray-900 mt-1">{ad.profileId.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">City</label>
                                        <p className="text-gray-900 mt-1">{ad.profileId.repairmanProfile?.city}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Address</label>
                                        <p className="text-gray-900 mt-1">{ad.profileId.repairmanProfile?.fullAddress}</p>
                                    </div>
                                </div>

                                {/* Specializations */}
                                {ad.profileId.repairmanProfile?.specializations?.length > 0 && (
                                    <div className="mb-4">
                                        <label className="text-sm font-medium text-gray-500 mb-2 block">Specializations</label>
                                        <div className="flex flex-wrap gap-2">
                                            {ad.profileId.repairmanProfile.specializations.map((spec, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                                                >
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {ad.profileId.repairmanProfile?.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">About</label>
                                        <p className="text-gray-700 mt-2 leading-relaxed">{ad.profileId.repairmanProfile.description}</p>
                                    </div>
                                )}
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
                                            {getCurrencySymbol(ad.currency)}{ad.total}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {getCurrencySymbol(ad.currency)}{(ad.total / ad.totalDays).toFixed(2)} per day
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Duration</label>
                                    <p className="text-gray-900 mt-1 font-semibold flex items-center">
                                        <Icon icon="mdi:calendar-clock" className="w-5 h-5 mr-2 text-primary-600" />
                                        {ad.totalDays} Days
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                                    <p className="text-gray-900 mt-1">{formatDate(ad.startDate).split(',')[0]}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">End Date</label>
                                    <p className="text-gray-900 mt-1">{formatDate(ad.endDate).split(',')[0]}</p>
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
