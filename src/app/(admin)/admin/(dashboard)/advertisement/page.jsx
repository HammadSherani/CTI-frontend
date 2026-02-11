"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';
import { useRouter } from 'next/navigation';

function Ads() {
    const router = useRouter();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [actionLoading, setActionLoading] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    // Suspend Modal State
    const [suspendModal, setSuspendModal] = useState({
        isOpen: false,
        adId: null
    });
    const [suspendReason, setSuspendReason] = useState('');
    const [suspendImage, setSuspendImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [suspendErrors, setSuspendErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalCounts, setTotalCounts] = useState({
        pending: 0,
        approve: 0,
        rejected: 0,
        block: 0,
        suspended: 0
    });
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    const { token } = useSelector((state) => state.auth);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterType]);

    // Fetch ads when page or filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAds();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus, filterType, currentPage]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (openDropdown) {
                setOpenDropdown(null);
            }
        };

        if (openDropdown) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openDropdown]);

    const fetchAds = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', 10);

            if (searchTerm) {
                params.append('search', searchTerm);
            }
            if (filterType) {
                params.append('type', filterType);
            }
            if (filterStatus) {
                params.append('status', filterStatus);
            }

            const { data } = await axiosInstance.get(`/admin/advertisements?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log(data, "Fetched advertisements");

            setAds(data.advertisements || []);
            setTotalCounts(data.totalCounts || {
                pending: 0,
                approve: 0,
                rejected: 0,
                block: 0,
                suspended: 0
            });
            setPagination({
                totalPages: data.pagination?.totalPages || 1,
                totalItems: data.pagination?.totalItems || 0,
                itemsPerPage: data.pagination?.itemsPerPage || 10
            });
            setLoading(false);
        } catch (error) {
            handleError(error);
            setAds([]);
            setLoading(false);
        }
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setSuspendErrors({ ...suspendErrors, image: 'Image size should be less than 5MB' });
                return;
            }
            setSuspendImage(file);
            setImagePreview(URL.createObjectURL(file));
            setSuspendErrors({ ...suspendErrors, image: '' });
        }
    };

    const validateSuspendForm = () => {
        const errors = {};
        if (!suspendReason.trim()) {
            errors.reason = 'Reason is required';
        }
        if (!suspendImage) {
            errors.image = 'Screenshot is required';
        }
        setSuspendErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSuspendSubmit = async () => {
        if (!validateSuspendForm()) {
            return;
        }

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('status', 'suspended');
            formData.append('title', suspendReason);
            formData.append('image', suspendImage);

            await axiosInstance.post(
                `/admin/advertisements/${suspendModal.adId}/status`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            toast.success('Advertisement suspended successfully');

            // Reset modal state
            setSuspendModal({ isOpen: false, adId: null });
            setSuspendReason('');
            setSuspendImage(null);
            setImagePreview('');
            setSuspendErrors({});

            fetchAds();
        } catch (error) {
            handleError(error);
            toast.error('Failed to suspend advertisement');
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleStatusChange = async (adId, newStatus) => {
        try {
            if (newStatus === "suspended") {
                setSuspendModal({ isOpen: true, adId });
                setOpenDropdown(null);
                return;
            }

            setActionLoading(prev => ({ ...prev, [adId]: 'updating' }));
            setOpenDropdown(null);

            await axiosInstance.post(
                `/admin/advertisements/${adId}/status`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            toast.success(`Status updated to ${newStatus}`);
            fetchAds();
        } catch (error) {
            handleError(error);
            toast.error('Failed to update status');
        } finally {
            setActionLoading(prev => ({ ...prev, [adId]: null }));
        }
    };

    const closeSuspendModal = () => {
        setSuspendModal({ isOpen: false, adId: null });
        setSuspendReason('');
        setSuspendImage(null);
        setImagePreview('');
        setSuspendErrors({});
    };
    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'approved': 'bg-green-100 text-green-800 border-green-200',
            'rejected': 'bg-red-100 text-red-800 border-red-200',
            'suspended': 'bg-orange-100 text-orange-800 border-orange-200',
            'blocked': 'bg-gray-700 text-white border-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'pending': 'mdi:clock-outline',
            'approved': 'mdi:check-circle',
            // 'rejected': 'mdi:close-circle',
            'suspended': 'mdi:pause-circle',
            // 'blocked': 'mdi:block-helper'
        };
        return icons[status] || 'mdi:help-circle';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCurrencySymbol = (currency) => {
        const symbols = {
            USD: '$',
            EUR: '€',
            PKR: '₨',
            TRY: '₺',
        };
        return symbols[currency] || currency;
    };



    const stats = {
        total: pagination.totalItems,
        approved: totalCounts.approved || 0,
        pending: totalCounts.pending || 0,
        rejected: totalCounts.rejected || 0,
        suspended: totalCounts.suspended || 0,
        blocked: totalCounts.block || 0
    };

    console.log(ads, "Advertisements data");
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Advertisement Management</h1>
                            <p className="text-gray-600 mt-1">Review and manage repairman advertisements</p>
                        </div>
                        <Link
                            href="/admin/advertisement/base-price"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5" />
                            BasePrice
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary-500">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:chart-line" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Ads</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.total}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:check-circle" className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Approved</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats?.approved}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:clock-outline" className="w-8 h-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.pending}
                                </p>
                            </div>
                        </div>
                    </div>



                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:pause-circle" className="w-8 h-8 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Suspended</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.suspended}
                                </p>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search advertisements..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Types</option>
                                <option value="service">Service</option>
                                <option value="profile">Profile</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                {/* <option value="rejected">Rejected</option> */}
                                <option value="suspended">Suspended</option>
                                {/* <option value="blocked">Blocked</option> */}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Ads Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <>
                        <div className="overflow-x-auto">

                            {loading ? (
                                <>
                                    <div className="flex !items-center !justify-center h-64">
                                        <div className="flex flex-col items-center justify-center">
                                            <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin text-center" />
                                            <p className="mt-4 text-gray-600 text-center">Loading content...</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <table className="min-w-full divide-y divide-gray-200 z-10">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Image
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>

                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Repairman
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Duration
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {ads?.map((ad) => (
                                                <tr key={ad._id} className="hover:bg-gray-50">
                                                    {/* Image */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex-shrink-0 h-16 w-16">
                                                            {ad.type === 'service' && ad.image ? (
                                                                <img
                                                                    src={ad.image}
                                                                    alt={ad.title || 'Service'}
                                                                    className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200"
                                                                />
                                                            ) : ad.type === 'profile' ? (
                                                                <img
                                                                    src={ad.user_id?.repairmanProfile?.profilePhoto || '/default-profile.png'}
                                                                    alt={ad.title || 'Service'}
                                                                    className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200"
                                                                />
                                                            ) : (
                                                                <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                    <Icon icon="mdi:image" className="w-8 h-8 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Type */}
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ad.type === 'service'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                            }`}>
                                                            <Icon
                                                                icon={ad.type === 'service' ? 'mdi:briefcase' : 'mdi:account'}
                                                                className="w-3 h-3 mr-1"
                                                            />
                                                            {ad.type === 'service' ? 'Service' : 'Profile'}
                                                        </span>
                                                    </td>



                                                    {/* Repairman */}
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm">
                                                            <div className="font-medium text-gray-900">
                                                                {ad.user_id?.repairmanProfile?.fullName || 'N/A'}
                                                            </div>
                                                            <div className="text-gray-500 text-xs">
                                                                {ad.user_id?.repairmanProfile?.emailAddress || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Duration */}
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm">
                                                            <div className="font-medium text-gray-900 flex items-center">
                                                                <Icon icon="mdi:calendar-clock" className="w-4 h-4 mr-1 text-gray-400" />
                                                                {ad.duration?.totalDays || 0} days
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {formatDate(ad.duration?.startDate)} - {formatDate(ad.duration?.endDate)}
                                                            </div>
                                                            <div className="text-xs font-medium text-primary-600 mt-1">
                                                                {getCurrencySymbol(ad.currency)}{ad.budget?.totalPrice || 0}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4">
                                                        {ad.isDeleted ? (
                                                            <>
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ad.status)}`}>
                                                                    <Icon icon="mdi:delete" className="w-3.5 h-3.5 mr-1.5" />
                                                                    Deleted
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ad.status)}`}>
                                                                    <Icon icon={getStatusIcon(ad.status)} className="w-3.5 h-3.5 mr-1.5" />
                                                                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                                                                </span>
                                                            </>
                                                        )}

                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => router.push(`/admin/advertisement/${ad._id}`)}
                                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                                                                title="View Details"
                                                            >
                                                                <Icon icon="mdi:eye" className="w-4 h-4 mr-1.5" />
                                                                View Details
                                                            </button>

                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenDropdown(openDropdown === ad._id ? null : ad._id);
                                                                    }}
                                                                    disabled={actionLoading[ad._id]}
                                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                                                                    title="Change Status"
                                                                >
                                                                    {actionLoading[ad._id] ? (
                                                                        <>
                                                                            <Icon icon="mdi:loading" className="w-4 h-4 mr-1.5 animate-spin" />
                                                                            Updating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Icon icon="mdi:swap-horizontal" className="w-4 h-4 mr-1.5" />
                                                                            Change Status
                                                                            <Icon icon="mdi:chevron-down" className="w-4 h-4 ml-1" />
                                                                        </>
                                                                    )}
                                                                </button>

                                                                {openDropdown === ad._id && !actionLoading[ad._id] && (
                                                                    <div
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="absolute right-0 bottom-0 block p-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 !z-[90]"
                                                                    >
                                                                        <div className="py-1">
                                                                            <button
                                                                                onClick={() => handleStatusChange(ad._id, 'approved')}
                                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center transition-colors"
                                                                            >
                                                                                <Icon icon="mdi:check-circle" className="w-4 h-4 mr-2 text-green-600" />
                                                                                Approve
                                                                            </button>
                                                                            {/* <button
                                                                            onClick={() => handleStatusChange(ad._id, 'rejected')}
                                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center transition-colors"
                                                                        >
                                                                            <Icon icon="mdi:close-circle" className="w-4 h-4 mr-2 text-red-600" />
                                                                            Reject
                                                                        </button> */}
                                                                            <button
                                                                                onClick={() => handleStatusChange(ad._id, 'suspended')}
                                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center transition-colors"
                                                                            >
                                                                                <Icon icon="mdi:pause-circle" className="w-4 h-4 mr-2 text-orange-600" />
                                                                                Suspend
                                                                            </button>
                                                                            {/* <button
                                                                            onClick={() => handleStatusChange(ad._id, 'blocked')}
                                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center transition-colors"
                                                                        >
                                                                            <Icon icon="mdi:block-helper" className="w-4 h-4 mr-2 text-gray-700" />
                                                                            Block
                                                                        </button> */}
                                                                            <button
                                                                                onClick={() => handleStatusChange(ad._id, 'pending')}
                                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center transition-colors border-t border-gray-100"
                                                                            >
                                                                                <Icon icon="mdi:clock-outline" className="w-4 h-4 mr-2 text-yellow-600" />
                                                                                Set Pending
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {ads.length === 0 && (
                                        <div className="text-center py-12">
                                            <Icon icon="mdi:chart-line-variant" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements found</h3>
                                            <p className="text-gray-500 mb-4">
                                                {searchTerm || filterStatus || filterType
                                                    ? 'Try adjusting your filters.'
                                                    : 'No advertisements submitted yet.'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Pagination */}
                        {ads.length > 0 && pagination.totalPages > 1 && (
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{((currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)}
                                    </span> of{' '}
                                    <span className="font-medium">{pagination.totalItems}</span> results
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                                    </button>

                                    {[...Array(pagination.totalPages)].map((_, idx) => {
                                        const pageNum = idx + 1;
                                        // Show first, last, current, and pages around current
                                        if (
                                            pageNum === 1 ||
                                            pageNum === pagination.totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === pageNum
                                                        ? 'bg-primary-600 text-white border-primary-600'
                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        } else if (
                                            pageNum === currentPage - 2 ||
                                            pageNum === currentPage + 2
                                        ) {
                                            return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                        disabled={currentPage === pagination.totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                </div>
            </div>


            {/* Suspend Modal */}
            {suspendModal.isOpen && (
                <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Suspend Advertisement</h3>
                                <button
                                    onClick={closeSuspendModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Icon icon="mdi:close" className="text-2xl" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a reason and screenshot for suspending this advertisement.
                            </p>

                            <div className="space-y-4">
                                {/* Reason Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={suspendReason}
                                        onChange={(e) => setSuspendReason(e.target.value)}
                                        placeholder="Enter reason for suspension..."
                                        rows={4}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${suspendErrors.reason ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {suspendErrors.reason && (
                                        <p className="mt-1 text-sm text-red-600">{suspendErrors.reason}</p>
                                    )}
                                </div>

                                {/* Screenshot Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Screenshot <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                                                alt="Preview"
                                            />
                                        )}
                                        <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500 transition-colors">
                                            <Icon icon="mdi:cloud-upload" className="mx-auto text-3xl text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">Click to upload screenshot</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {suspendErrors.image && (
                                        <p className="mt-1 text-sm text-red-600">{suspendErrors.image}</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={closeSuspendModal}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSuspendSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Icon icon="mdi:loading" className="animate-spin mr-2" />
                                            Suspending...
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="mdi:pause-circle" className="mr-2" />
                                            Suspend Ad
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



        </div>
    );
}

export default Ads;
