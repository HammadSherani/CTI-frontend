"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

function AdminBrandPage() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalBrands: 0,
        hasNext: false,
        hasPrev: false
    });
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchBrands();
    }, [currentPage, searchTerm, filterActive]);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(searchTerm && { search: searchTerm }),
                ...(filterActive !== 'all'
                     && { status: filterActive === 'active' ? 'true' : 'false' }
                    )
            });

            const response = await axiosInstance.get(`/admin/brands?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setBrands(response.data.data.brands || []);
            setPagination(response.data.data.pagination || {});
        } catch (error) {
            console.error('Error fetching brands:', error);
            setSubmitError('Failed to load brands');
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (brand) => {
        console.log('Edit brand:', brand);
    };

    const handleDelete = async (brandId) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            try {
                const res = await axiosInstance.delete(`/admin/brands/${brandId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success(res.data.message);
                setSubmitSuccess('Brand deleted successfully!');
                setTimeout(() => setSubmitSuccess(''), 3000);
                fetchBrands();
            } catch (error) {
                console.error('Delete error:', error);
                setSubmitError('Failed to delete brand. Please try again.');
                toast.error('Failed to delete brand');
            }
        }
    };

    const toggleActive = async (brandId) => {
        try {
            const brand = brands.find(br => br._id === brandId);
            const res = await axiosInstance.put(`/admin/brands/${brandId}`, 
                { isActive: !brand.isActive },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success(res.data.message);
            fetchBrands();
        } catch (error) {
            console.error('Toggle active error:', error);
            setSubmitError('Failed to update brand status. Please try again.');
            toast.error('Failed to update brand status');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
                disabled={!pagination.hasPrev}
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
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        );

        return (
            <div className="flex items-center justify-between mt-6 px-8 py-2">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                    <span className="font-medium">
                        {Math.min(currentPage * 10, pagination.totalBrands)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.totalBrands}</span> results
                </div>
                <div className="flex">{pages}</div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
                            <p className="text-gray-600 mt-1">Manage device brands and manufacturers</p>
                        </div>
                        <Link
                            href="/admin/brand/create"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5" />
                            Add Brand
                        </Link>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {submitSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 mr-2" />
                            <p className="text-green-800">{submitSuccess}</p>
                        </div>
                    </div>
                )}

                {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-800">{submitError}</p>
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search brands..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:filter" className="text-gray-400 w-5 h-5" />
                            <select
                                value={filterActive}
                                onChange={(e) => setFilterActive(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Brands</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Brands Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Loading brands...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Logo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Brand Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Slug
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Models
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
                                        {brands.map((brand) => (
                                            <tr key={brand._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                                        {brand.icon ? (
                                                            <img 
                                                                src={brand.icon} 
                                                                alt={brand.name}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'block';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <Icon 
                                                            icon="mdi:domain" 
                                                            className="w-6 h-6 text-gray-400"
                                                            style={{ display: brand.icon ? 'none' : 'block' }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500">{brand.slug}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {brand.totalModels || 0} models
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleActive(brand._id)}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            brand.isActive
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        } transition-colors`}
                                                    >
                                                        <Icon
                                                            icon={brand.isActive ? 'mdi:eye' : 'mdi:eye-off'}
                                                            className="w-3 h-3 mr-1"
                                                        />
                                                        {brand.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link 
                                                            href={`/admin/brand/${brand._id}/edit`}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="Edit brand"
                                                        >
                                                            <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(brand._id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Delete brand"
                                                        >
                                                            <Icon icon="mdi:trash-can" className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && brands.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:domain" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterActive !== 'all'
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by creating your first brand.'
                                            }
                                        </p>
                                        {(!searchTerm && filterActive === 'all') && (
                                            <Link
                                                href="/admin/brand/create"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 mt-4"
                                            >
                                                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                                                Create your first brand
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
                                <Icon icon="mdi:domain" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Brands</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : pagination.totalBrands}
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
                                <p className="text-sm font-medium text-gray-500">Active Brands</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : brands.filter(brand => brand.isActive).length}
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
                                <p className="text-sm font-medium text-gray-500">Inactive Brands</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : brands.filter(brand => !brand.isActive).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminBrandPage;