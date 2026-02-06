"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';
import { useRouter } from 'next/navigation';
import useDebounce from '@/hooks/useDebounce'; // Adjust the import path as needed

function Ads() {
    const router = useRouter();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCounts, setTotalCounts] = useState({
        pending: 0,
        approve: 0,
        suspended: 0,
        block: 0
    });
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    
    const { token } = useSelector((state) => state.auth);

    // Reset to page 1 when debounced search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filterStatus, filterType]);

    // Fetch ads when debounced search, filters, or page change
    useEffect(() => {
        fetchAds();
    }, [debouncedSearch, filterStatus, filterType, currentPage]);

    const fetchAds = async () => {
        try {
            setLoading(true);
            
            // Build query params
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', 10);
            
            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }
            if (filterType) {
                params.append('type', filterType);
            }
            if (filterStatus) {
                params.append('status', filterStatus);
            }

            const { data } = await axiosInstance.get(`/repairman/advertisements?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log(data, "Fetched advertisements");
            
            setAds(data.advertisements || []);
            setTotalCounts(data.totalCounts || {
                pending: 0,
                approve: 0,
                suspended: 0,
                block: 0
            });
            setPagination({
                totalPages: data.pagination?.totalPages || 1,
                totalItems: data.pagination?.totalItems || 0,
                itemsPerPage: data.pagination?.itemsPerPage || 10
            });
        } catch (error) {
            handleError(error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAd = async () => {
        if (!selectedAd) return;

        try {
            setIsDeleting(true);

            // Optimistic update
            const deletedStatus = selectedAd.status;
            const updatedAds = ads.filter(a => a._id !== selectedAd._id);
            setAds(updatedAds);

            // Update totalCounts
            let statusKey = deletedStatus;
            if (statusKey === 'approved') statusKey = 'approve';
            const newTotalCounts = { ...totalCounts };
            if (newTotalCounts.hasOwnProperty(statusKey)) {
                newTotalCounts[statusKey] = Math.max(0, newTotalCounts[statusKey] - 1);
            }
            setTotalCounts(newTotalCounts);

            // Update pagination
            const newTotalItems = pagination.totalItems - 1;
            const newTotalPages = Math.ceil(newTotalItems / pagination.itemsPerPage);
            setPagination({
                ...pagination,
                totalItems: newTotalItems,
                totalPages: newTotalPages
            });

            // If page is now empty and not first page, go to previous
            if (updatedAds.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }

            // Perform actual delete
            await axiosInstance.delete(`/repairman/advertisements/delete/${selectedAd._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            toast.success('Advertisement deleted successfully');
        } catch (error) {
            // Revert on error by refetching
            toast.error('Failed to delete advertisement');
            handleError(error);
            fetchAds();
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setSelectedAd(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'expired': 'bg-gray-100 text-gray-800',
            'suspended': 'bg-orange-100 text-orange-800',
            'block': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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

    const truncateText = (text, maxLength = 60) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const stats = {
        total: pagination.totalItems,
        approved: totalCounts.approve || 0,
        pending: totalCounts.pending || 0,
        rejected: (totalCounts.block || 0) + (totalCounts.suspended || 0)
    };

    const renderSkeletonRows = () => {
        return Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                    <div className="h-16 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex gap-2">
                        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Advertisements</h1>
                            <p className="text-gray-600 mt-1">Manage your service and profile advertisements</p>
                        </div>
                        <Link
                            href="/repair-man/ads/create"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5" />
                            Create Advertisement
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
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

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:check-circle" className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Approved</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.approved}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
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

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:close-circle" className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Rejected</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.rejected}
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
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Ads Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title/Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
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
                                {loading ? (
                                    renderSkeletonRows()
                                ) : (
                                    ads.map((ad) => (
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
                                                            src={ad.user_id?.repairmanProfile?.profilePhoto}
                                                            alt={ad.user_id?.repairmanProfile?.fullName || 'profile'}
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
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    ad.type === 'service' 
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

                                            {/* Title/Name */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {ad.type === 'service' 
                                                            ? (ad.title || 'Untitled Service')
                                                            : ad.user_id?.repairmanProfile?.fullName || 'Unnamed Profile'}
                                                    </div>
                                                    {ad.type === 'service' && ad.city?.name && (
                                                        <div className="text-gray-500 text-xs flex items-center mt-1">
                                                            <Icon icon="mdi:map-marker" className="w-3 h-3 mr-1" />
                                                            {ad.city.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Description */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 max-w-xs">
                                                    {truncateText(ad.description||ad.user_id?.repairmanProfile?.description)}
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
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                                                    {ad.status === 'approved' && <Icon icon="mdi:check-circle" className="w-3 h-3 mr-1" />}
                                                    {ad.status === 'pending' && <Icon icon="mdi:clock-outline" className="w-3 h-3 mr-1" />}
                                                    {ad.status === 'rejected' && <Icon icon="mdi:close-circle" className="w-3 h-3 mr-1" />}
                                                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => router.push(`/repair-man/ads/${ad._id}`)}
                                                        className="text-primary-600 hover:text-primary-900 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Icon icon="mdi:eye" className="w-5 h-5" />
                                                    </button>

                                                    {ad.status !== 'approved' && ad.status !== 'suspended' && (
                                                        <button
                                                            onClick={() => router.push(`/repair-man/ads/edit/${ad._id}`)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            setSelectedAd(ad);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Icon icon="mdi:delete" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && ads.length === 0 && (
                        <div className="text-center py-12">
                            <Icon icon="mdi:chart-line-variant" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || filterStatus || filterType
                                    ? 'Try adjusting your filters.'
                                    : 'Create your first advertisement to get started.'
                                }
                            </p>
                            {!searchTerm && !filterStatus && !filterType && (
                                <Link
                                    href="/repair-man/ads/create"
                                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Icon icon="mdi:plus" className="w-5 h-5" />
                                    Create Advertisement
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && ads.length > 0 && pagination.totalPages > 1 && (
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
                                                className={`px-3 py-1 border rounded-md text-sm font-medium ${
                                                    currentPage === pageNum
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
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Advertisement</h3>
                                <p className="text-sm text-gray-600">Are you sure you want to delete this ad?</p>
                            </div>
                        </div>

                        {selectedAd && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">
                                        {selectedAd.type === 'service' 
                                            ? (selectedAd.title || 'Untitled Service')
                                            : 'Profile Advertisement'}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    This action cannot be undone.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedAd(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={handleDeleteAd}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Ads;