"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import useDebounce from '@/hooks/useDebounce';
import Image from 'next/image';

function AcademyContentPage() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingIds, setLoadingIds] = useState({});
    const [deletingIds, setDeletingIds] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [filterActive, setFilterActive] = useState('all');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const { token } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        totalContent: 0,
        totalActive: 0,
        totalInactive: 0
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 10,
        totalItems: 0,
    });

    useEffect(() => {
        fetchCategories(pagination.currentPage, debouncedSearch, filterActive);
    }, [debouncedSearch, pagination.currentPage, filterActive]);

    const fetchCategories = async (page = 1, search = '', status = 'all') => {
        try {
            setLoading(true);
            const limit = 10;
            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('limit', String(limit));
            if (search) params.append('search', search);
            if (status !== 'all') {
                params.append('isActive', status === 'active' ? 'true' : 'false');
            }

            const response = await axiosInstance.get(`/admin/academic-content?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = response.data.data || [];
            setCategories(data);
            setFilteredCategories(data);
            
            if (response.data.stats) {
                setStats(response.data.stats);
            }
            
            if (response.data.pagination) {
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setSubmitError('Failed to load categories');
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this content?')) return;

        const originalIndex = categories.findIndex(c => c._id === categoryId);
        const originalItem = categories[originalIndex];

        // set deleting flag for this item
        setDeletingIds(prev => ({ ...prev, [categoryId]: true }));

        // Optimistically remove from UI
        setCategories(prev => prev.filter(c => c._id !== categoryId));
        setFilteredCategories(prev => prev.filter(c => c._id !== categoryId));
        setPagination(prev => ({ ...prev, totalItems: Math.max(0, (prev.totalItems || 0) - 1) }));

        try {
            const res = await axiosInstance.delete(`/admin/academic-content/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success(res.data.message || 'Content deleted successfully!');
            setSubmitSuccess('Content deleted successfully!');
            setTimeout(() => setSubmitSuccess(''), 3000);

            // If current page became empty, go to previous page
            const remainingOnPage = filteredCategories.length - 1;
            if (remainingOnPage <= 0 && pagination.currentPage > 1) {
                setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
            }
        } catch (error) {
            console.error('Delete error:', error);
            // revert UI
            setCategories(prev => {
                const copy = [...prev];
                copy.splice(originalIndex, 0, originalItem);
                return copy;
            });
            setFilteredCategories(prev => {
                const copy = [...prev];
                copy.splice(originalIndex, 0, originalItem);
                return copy;
            });
            setPagination(prev => ({ ...prev, totalItems: (prev.totalItems || 0) + 1 }));

            setSubmitError('Failed to delete content. Please try again.');
            toast.error('Failed to delete content');
        } finally {
            setDeletingIds(prev => {
                const copy = { ...prev };
                delete copy[categoryId];
                return copy;
            });
        }
    };

    const toggleActive = async (categoryId, currentStatus) => {
        // Optimistic update: set loading for this item and toggle UI immediately
        setLoadingIds(prev => ({ ...prev, [categoryId]: true }));

        // Optimistically update categories and filteredCategories
        setCategories(prev => prev.map(c => c._id === categoryId ? { ...c, isActive: !currentStatus } : c));
        setFilteredCategories(prev => prev.map(c => c._id === categoryId ? { ...c, isActive: !currentStatus } : c));

        // Update stats locally to avoid refetching whole list
        setStats(prevStats => {
            const totalActive = !currentStatus ? prevStats.totalActive + 1 : Math.max(0, prevStats.totalActive - 1);
            const totalInactive = !currentStatus ? Math.max(0, prevStats.totalInactive - 1) : prevStats.totalInactive + 1;
            return { ...prevStats, totalActive, totalInactive };
        });

        try {
            const res = await axiosInstance.patch(
                `/admin/academic-content/status/${categoryId}`,
                { isActive: !currentStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success(res.data.message || 'Content status updated!');
        } catch (error) {
            console.error('Toggle active error:', error);
            // Revert optimistic update on failure
            setCategories(prev => prev.map(c => c._id === categoryId ? { ...c, isActive: currentStatus } : c));
            setFilteredCategories(prev => prev.map(c => c._id === categoryId ? { ...c, isActive: currentStatus } : c));
            // Revert stats
            setStats(prevStats => {
                const totalActive = !currentStatus ? Math.max(0, prevStats.totalActive - 1) : prevStats.totalActive + 1;
                const totalInactive = !currentStatus ? prevStats.totalInactive + 1 : Math.max(0, prevStats.totalInactive - 1);
                return { ...prevStats, totalActive, totalInactive };
            });

            setSubmitError('Failed to update content status. Please try again.');
            toast.error('Failed to update content status');
        } finally {
            setLoadingIds(prev => {
                const copy = { ...prev };
                delete copy[categoryId];
                return copy;
            });
        }
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.totalPages) return;
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const renderPagination = () => {
        const total = pagination.totalPages || 1;
        const current = pagination.currentPage || 1;
        if (total <= 1) return null;

        const maxVisible = 5;
        let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
        let endPage = Math.min(total, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) pages.push(i);

        const from = ((current - 1) * pagination.itemsPerPage) + 1;
        const to = Math.min(current * pagination.itemsPerPage, pagination.totalItems);

        return (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of <span className="font-medium">{pagination.totalItems}</span>
                </div>
                <div className="inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                        onClick={() => handlePageChange(current - 1)}
                        disabled={current === 1}
                        className={`px-3 py-2 bg-white border border-gray-300 rounded-l-md text-sm ${current === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        Prev
                    </button>
                    {pages.map(p => (
                        <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-2 border-t border-b border-gray-300 text-sm ${p === current ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(current + 1)}
                        disabled={current === total}
                        className={`px-3 py-2 bg-white border border-gray-300 rounded-r-md text-sm ${current === total ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Academy Content</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage your academy content and courses
                            </p>
                        </div>
                        <Link
                            href="/admin/academy/ace-management/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                            Add New Course
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

                {/* Stats */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:book-open-page-variant" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Content</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : stats.totalContent}
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
                                <p className="text-sm font-medium text-gray-500">Active</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : categories.filter(cat => cat.isActive).length}
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
                                <p className="text-sm font-medium text-gray-500">Inactive</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : categories.filter(cat => !cat.isActive).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

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
                                    placeholder="Search by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Active Status Filter */}
                        <div className="sm:w-48">
                            <select
                                value={filterActive}
                                onChange={(e) => {
                                    setFilterActive(e.target.value);
                                    setPagination(prev => ({ ...prev, currentPage: 1 }));
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
                                    setPagination(prev => ({ ...prev, currentPage: 1 }));
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
                                <p className="mt-4 text-gray-600">Loading content...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thumbnail
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
                                                Created
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCategories.map((category) => (
                                            <tr key={category._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                                        {category.image && (category.image.startsWith('http') || category.image.startsWith('/')) ? (
                                                            <Image
                                                                src={category.image}
                                                                alt={category.title}
                                                                width={64}
                                                                height={64}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <Icon
                                                                icon="mdi:image-outline"
                                                                className="w-8 h-8 text-gray-400"
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                        {category.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {category.slug}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 max-w-md truncate">
                                                        {category.description?.substring(0, 80)}
                                                        {category.description?.length > 80 ? '...' : ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {(() => {
                                                        const isUpdating = !!loadingIds[category._id];
                                                        return (
                                                            <button
                                                                onClick={() => !isUpdating && toggleActive(category._id, category.isActive)}
                                                                disabled={isUpdating}
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    category.isActive
                                                                        ? 'bg-green-100 text-green-800 ' + (isUpdating ? 'opacity-80 cursor-not-allowed' : 'hover:bg-green-200')
                                                                        : 'bg-red-100 text-red-800 ' + (isUpdating ? 'opacity-80 cursor-not-allowed' : 'hover:bg-red-200')
                                                                } transition-colors`}
                                                            >
                                                                {isUpdating ? (
                                                                    <Icon icon="mdi:loading" className="w-3 h-3 mr-1 animate-spin" />
                                                                ) : (
                                                                    <Icon icon={category.isActive ? 'mdi:eye' : 'mdi:eye-off'} className="w-3 h-3 mr-1" />
                                                                )}
                                                                {category.isActive ? 'Active' : 'Inactive'}
                                                            </button>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(category.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                       
                                                        <Link
                                                            href={`/admin/academy/ace-management/${category.slug}/edit`}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="Edit content"
                                                        >
                                                            <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                        </Link>
                                                        {(() => {
                                                            const isDeleting = !!deletingIds[category._id];
                                                            return (
                                                                <button
                                                                    onClick={() => !isDeleting && handleDelete(category._id)}
                                                                    disabled={isDeleting}
                                                                    className={`text-red-600 ${isDeleting ? 'opacity-80 cursor-not-allowed' : 'hover:text-red-900'} transition-colors`}
                                                                    title="Delete content"
                                                                >
                                                                    {isDeleting ? (
                                                                        <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                                                                    ) : (
                                                                        <Icon icon="mdi:trash-can" className="w-5 h-5" />
                                                                    )}
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && filteredCategories.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:book-open-page-variant" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterActive !== 'all'
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by creating your first course.'
                                            }
                                        </p>
                                        {(!searchTerm && filterActive === 'all') && (
                                            <Link
                                                href="/admin/academy/ace-management/create"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 mt-4"
                                            >
                                                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                                                Create your first course
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                            {renderPagination()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AcademyContentPage;