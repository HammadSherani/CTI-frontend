"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

function PartsCategoryPage() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [filterFeatured, setFilterFeatured] = useState('all');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [categories, searchTerm, filterActive, filterFeatured]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/parts/parts-categories/get-categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setSubmitError('Failed to load categories');
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...categories];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(cat =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Active status filter
        if (filterActive !== 'all') {
            filtered = filtered.filter(cat =>
                filterActive === 'active' ? cat.isActive : !cat.isActive
            );
        }

        // Featured filter
        if (filterFeatured !== 'all') {
            filtered = filtered.filter(cat =>
                filterFeatured === 'featured' ? cat.isFeatured : !cat.isFeatured
            );
        }

        setFilteredCategories(filtered);
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const res = await axiosInstance.delete(`/admin/parts/parts-categories/${categoryId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success(res.data.message || 'Category deleted successfully!');
                setSubmitSuccess('Category deleted successfully!');
                setTimeout(() => setSubmitSuccess(''), 3000);
                fetchCategories();
            } catch (error) {
                console.error('Delete error:', error);
                setSubmitError('Failed to delete category. Please try again.');
                toast.error('Failed to delete category');
            }
        }
    };

    const toggleActive = async (categoryId) => {
        try {
            const category = categories.find(c => c._id === categoryId);
            const res = await axiosInstance.put(`/admin/parts/parts-categories/${categoryId}`,
                { isActive: !category.isActive },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success(res.data.message || 'Category status updated!');
            fetchCategories();
        } catch (error) {
            console.error('Toggle active error:', error);
            setSubmitError('Failed to update category status. Please try again.');
            toast.error('Failed to update category status');
        }
    };

    const toggleFeatured = async (categoryId) => {
        try {
            const category = categories.find(c => c._id === categoryId);
            const res = await axiosInstance.put(`/admin/parts/parts-categories/${categoryId}`,
                { isFeatured: !category.isFeatured },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success(res.data.message || 'Featured status updated!');
            fetchCategories();
        } catch (error) {
            console.error('Toggle featured error:', error);
            setSubmitError('Failed to update featured status. Please try again.');
            toast.error('Failed to update featured status');
        }
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
                            <h1 className="text-3xl font-bold text-gray-900">Parts Categories</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage your parts categories and classifications
                            </p>
                        </div>
                        <Link
                            href="/admin/parts/parts-categories/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                            Add New Category
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
                                    placeholder="Search by category name..."
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
                                onChange={(e) => setFilterActive(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Featured Filter */}
                        <div className="sm:w-48">
                            <select
                                value={filterFeatured}
                                onChange={(e) => setFilterFeatured(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="all">All Categories</option>
                                <option value="featured">Featured</option>
                                <option value="not-featured">Not Featured</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(searchTerm || filterActive !== 'all' || filterFeatured !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterActive('all');
                                    setFilterFeatured('all');
                                }}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Icon icon="mdi:filter-off" className="w-4 h-4 mr-2" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
          

                {/* Table */}
                <div className="bg-white mb-5 shadow-sm rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center">
                                <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin" />
                                <p className="mt-4 text-gray-600">Loading categories...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Icon
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Featured
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
                                                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                                        {category.icon ? (
                                                            <img
                                                                src={category.icon}
                                                                alt={category.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div
                                                            className="w-full h-full items-center justify-center"
                                                            style={{ display: category.icon ? 'none' : 'flex' }}
                                                        >
                                                            <Icon
                                                                icon="mdi:image-outline"
                                                                className="w-6 h-6 text-gray-400"
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {category.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleActive(category._id)}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            category.isActive
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        } transition-colors`}
                                                    >
                                                        <Icon
                                                            icon={category.isActive ? 'mdi:eye' : 'mdi:eye-off'}
                                                            className="w-3 h-3 mr-1"
                                                        />
                                                        {category.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleFeatured(category._id)}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            category.isFeatured
                                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                        } transition-colors`}
                                                    >
                                                        <Icon
                                                            icon={category.isFeatured ? 'mdi:star' : 'mdi:star-outline'}
                                                            className="w-3 h-3 mr-1"
                                                        />
                                                        {category.isFeatured ? 'Featured' : 'Regular'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(category.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/parts/parts-categories/${category._id}/edit`}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="Edit category"
                                                        >
                                                            <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(category._id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Delete category"
                                                        >
                                                            <Icon icon="mdi:trash-can" className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && filteredCategories.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:shape-outline" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterActive !== 'all' || filterFeatured !== 'all'
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by creating your first category.'
                                            }
                                        </p>
                                        {(!searchTerm && filterActive === 'all' && filterFeatured === 'all') && (
                                            <Link
                                                href="/admin/parts/parts-categories/create"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 mt-4"
                                            >
                                                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                                                Create your first category
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:shape-outline" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Categories</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : categories.length}
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

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:star" className="w-8 h-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Featured</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : categories.filter(cat => cat.isFeatured).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>

            
        </div>
    );
}

export default PartsCategoryPage;