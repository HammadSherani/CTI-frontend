"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

function AdminBannersPage() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20
    });
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchBanners();
    }, [currentPage, searchTerm, filterActive]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                ...(searchTerm && { search: searchTerm }),
                ...(filterActive !== 'all' && { 
                    isActive: filterActive === 'active' ? 'true' : 'false' 
                })
            });

            const response = await axiosInstance.get(`/admin/banners?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setBanners(response.data.data || []);
            setPagination(response.data.pagination || {});
        } catch (error) {
            console.error('Error fetching banners:', error);
            setSubmitError('Failed to load banners');
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (bannerId) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                const res = await axiosInstance.delete(`/admin/banners/${bannerId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success(res.data.message || 'Banner deleted successfully!');
                setSubmitSuccess('Banner deleted successfully!');
                setTimeout(() => setSubmitSuccess(''), 3000);
                fetchBanners();
            } catch (error) {
                console.error('Delete error:', error);
                setSubmitError('Failed to delete banner. Please try again.');
                toast.error('Failed to delete banner');
            }
        }
    };

    const toggleActive = async (bannerId) => {
        try {
            const banner = banners.find(b => b._id === bannerId);
            const res = await axiosInstance.put(`/admin/banners/${bannerId}`, 
                { isActive: !banner.isActive },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success(res.data.message || 'Banner status updated!');
            fetchBanners();
        } catch (error) {
            console.error('Toggle active error:', error);
            setSubmitError('Failed to update banner status. Please try again.');
            toast.error('Failed to update banner status');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
        );

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 hover:bg-gray-50 ${
                        currentPage === i
                            ? 'bg-primary-50 text-primary-600 border-primary-500'
                            : 'bg-white text-gray-500'
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-r border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        );

        return (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{((currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)}
                            </span> of{' '}
                            <span className="font-medium">{pagination.totalItems}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            {pages}
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Banners Management</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage your promotional banners and campaigns
                            </p>
                        </div>
                        <Link
                            href="/admin/banners/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                            Add New Banner
                        </Link>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                        <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 mr-3" />
                        <span className="text-green-800">{submitSuccess}</span>
                    </div>
                )}
                {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 mr-3" />
                        <span className="text-red-800">{submitError}</span>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon icon="mdi:magnify" className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by title or label..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="sm:w-48">
                            <select
                                value={filterActive}
                                onChange={(e) => {
                                    setFilterActive(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(searchTerm || filterActive !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterActive('all');
                                    setCurrentPage(1);
                                }}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Icon icon="mdi:filter-off" className="w-4 h-4 mr-2" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center">
                                <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin" />
                                <p className="mt-4 text-gray-600">Loading banners...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Image
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Label
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {banners.map((banner) => (
                                            <tr key={banner._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center justify-center w-24 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                                        {banner.image ? (
                                                            <img 
                                                                src={banner.image} 
                                                                alt={banner.title || 'Banner'}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div 
                                                            className="w-full h-full items-center justify-center"
                                                            style={{ display: banner.image ? 'none' : 'flex' }}
                                                        >
                                                            <Icon 
                                                                icon="mdi:image-outline" 
                                                                className="w-8 h-8 text-gray-400"
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {banner.label || 'No Label'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {banner.title || 'No Title'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500">
                                                        {truncateText(banner.description) || 'No Description'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleActive(banner._id)}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            banner.isActive
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        } transition-colors`}
                                                    >
                                                        <Icon
                                                            icon={banner.isActive ? 'mdi:eye' : 'mdi:eye-off'}
                                                            className="w-3 h-3 mr-1"
                                                        />
                                                        {banner.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link 
                                                            href={`/admin/banners/${banner._id}/edit`}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="Edit banner"
                                                        >
                                                            <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(banner._id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Delete banner"
                                                        >
                                                            <Icon icon="mdi:trash-can" className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && banners.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:billboard" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterActive !== 'all'
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by creating your first banner.'
                                            }
                                        </p>
                                        {(!searchTerm && filterActive === 'all') && (
                                            <Link
                                                href="/admin/banners/create"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 mt-4"
                                            >
                                                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                                                Create your first banner
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {!loading && renderPagination()}
                        </>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:billboard" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Banners</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : pagination.totalItems}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:eye" className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Active Banners</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : banners.filter(banner => banner.isActive).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:eye-off" className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Inactive Banners</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : banners.filter(banner => !banner.isActive).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminBannersPage;