"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

function StockManagementPage() {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBrand, setFilterBrand] = useState('');
    const [filterModel, setFilterModel] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterCondition, setFilterCondition] = useState('');
    const [filterStock, setFilterStock] = useState('all');
    const [filterActive, setFilterActive] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    
    // Dropdown data
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [allModels, setAllModels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);
    
    const { token } = useSelector((state) => state.auth);

    // Stats state
    const [stats, setStats] = useState({
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0
    });

    // Fetch dropdown data on mount
    useEffect(() => {
        fetchDropdownData();
    }, []);

    // Fetch parts when filters change
    useEffect(() => {
        fetchParts();
    }, [currentPage, searchTerm, filterBrand, filterModel, filterCategory, filterCondition, filterStock, filterActive]);

    // Filter models based on selected brand
    useEffect(() => {
        if (filterBrand) {
            const filteredModels = allModels.filter(model => model.brand === filterBrand);
            setModels(filteredModels);
            // Reset model filter if selected model doesn't belong to new brand
            if (filterModel && !filteredModels.find(m => m._id === filterModel)) {
                setFilterModel('');
            }
        } else {
            setModels(allModels);
        }
    }, [filterBrand, allModels]);

    const fetchDropdownData = async () => {
        try {
            setLoadingDropdowns(true);

            // Fetch brands
            const brandsResponse = await axiosInstance.get('/admin/brands', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBrands(brandsResponse.data.data.brands || []);

            // Fetch all models
            const modelsResponse = await axiosInstance.get('/admin/models', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllModels(modelsResponse.data.data.models || []);
            setModels(modelsResponse.data.data.models || []);

            // Fetch categories
            const categoriesResponse = await axiosInstance.get('/admin/parts/parts-categories/get-categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(categoriesResponse.data.data || []);

        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            toast.error('Failed to load filter options');
        } finally {
            setLoadingDropdowns(false);
        }
    };

    const fetchParts = async () => {
        try {
            setLoading(true);
            
            const params = {
                page: currentPage,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            };

            if (searchTerm) params.search = searchTerm;
            if (filterBrand) params.brand = filterBrand;
            if (filterModel) params.model = filterModel;
            if (filterCategory) params.category = filterCategory;
            if (filterCondition) params.condition = filterCondition;
            if (filterStock !== 'all') params.inStock = filterStock;
            if (filterActive !== 'all') params.isActive = filterActive;

            const response = await axiosInstance.get(`/admin/parts`, {
                params,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setParts(response.data.data.parts || []);
            setPagination(response.data.data.pagination || {});
            calculateStats(response.data.data.parts || []);
        } catch (error) {
            console.error('Error fetching parts:', error);
            setSubmitError('Failed to load parts');
            toast.error('Failed to load parts');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (partsData) => {
        const total = partsData.length;
        const inStock = partsData.filter(p => p.stock > 10).length;
        const lowStock = partsData.filter(p => p.stock > 0 && p.stock <= 10).length;
        const outOfStock = partsData.filter(p => p.stock === 0).length;

        setStats({ total, inStock, lowStock, outOfStock });
    };

    const handleDelete = async (partId) => {
        if (window.confirm('Are you sure you want to delete this part?')) {
            try {
                const res = await axiosInstance.delete(`/admin/parts/${partId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success(res.data.message || 'Part deleted successfully!');
                setSubmitSuccess('Part deleted successfully!');
                setTimeout(() => setSubmitSuccess(''), 3000);
                fetchParts();
            } catch (error) {
                console.error('Delete error:', error);
                setSubmitError('Failed to delete part. Please try again.');
                toast.error('Failed to delete part');
            }
        }
    };

    const getStockLevelBadge = (stock) => {
        if (stock === 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Icon icon="mdi:alert-circle" className="w-3 h-3 mr-1" />
                    Out of Stock
                </span>
            );
        } else if (stock <= 10) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Icon icon="mdi:alert" className="w-3 h-3 mr-1" />
                    Low Stock ({stock})
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Icon icon="mdi:check-circle" className="w-3 h-3 mr-1" />
                    In Stock ({stock})
                </span>
            );
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
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

    const clearFilters = () => {
        setSearchTerm('');
        setFilterBrand('');
        setFilterModel('');
        setFilterCategory('');
        setFilterCondition('');
        setFilterStock('all');
        setFilterActive('all');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchTerm || filterBrand || filterModel || filterCategory || 
                            filterCondition || filterStock !== 'all' || filterActive !== 'all';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Track and manage your parts inventory and stock levels
                            </p>
                        </div>
                        <Link
                            href="/admin/parts/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                            Add New Part
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
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:package-variant" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Parts</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : pagination.totalParts || 0}
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
                                <p className="text-sm font-medium text-gray-500">In Stock</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : stats.inStock}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:alert" className="w-8 h-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : stats.lowStock}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:alert-circle" className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : stats.outOfStock}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon icon="mdi:magnify" className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, SKU, or description..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Stock Status Filter */}
                        <div>
                            <select
                                value={filterStock}
                                onChange={(e) => {
                                    setFilterStock(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="all">All Stock Status</option>
                                <option value="true">In Stock</option>
                                <option value="false">Out of Stock</option>
                            </select>
                        </div>

                        {/* Active Status Filter */}
                        <div>
                            <select
                                value={filterActive}
                                onChange={(e) => {
                                    setFilterActive(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>

                        {/* Brand Filter - Dropdown */}
                        <div>
                            <select
                                value={filterBrand}
                                onChange={(e) => {
                                    setFilterBrand(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                disabled={loadingDropdowns}
                            >
                                <option value="">All Brands</option>
                                {brands.map(brand => (
                                    <option key={brand._id} value={brand._id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Model Filter - Dropdown */}
                        <div>
                            <select
                                value={filterModel}
                                onChange={(e) => {
                                    setFilterModel(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                disabled={loadingDropdowns}
                            >
                                <option value="">All Models</option>
                                {models.map(model => (
                                    <option key={model._id} value={model._id}>
                                        {model.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter - Dropdown */}
                        <div>
                            <select
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                disabled={loadingDropdowns}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Condition Filter */}
                        <div>
                            <select
                                value={filterCondition}
                                onChange={(e) => {
                                    setFilterCondition(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="">All Conditions</option>
                                <option value="New">New</option>
                                <option value="Used">Used</option>
                                <option value="Refurbished">Refurbished</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <div className="flex items-center">
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full justify-center"
                                >
                                    <Icon icon="mdi:filter-off" className="w-4 h-4 mr-2" />
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center">
                                <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin" />
                                <p className="mt-4 text-gray-600">Loading parts...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Part Details
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Brand/Model
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Condition
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {parts.map((part) => (
                                            <tr key={part._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-12 w-12">
                                                            {part.images && part.images.length > 0 ? (
                                                                <img
                                                                    src={part.images[0]}
                                                                    alt={part.name}
                                                                    className="h-12 w-12 rounded-lg object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div
                                                                className="h-12 w-12 rounded-lg bg-gray-100 items-center justify-center"
                                                                style={{ display: (part.images && part.images.length > 0) ? 'none' : 'flex' }}
                                                            >
                                                                <Icon icon="mdi:car-cog" className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {part.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                SKU: {part.sku || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {part.brand?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {part.model?.name || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {part.category?.name || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {part.stock || '0'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatPrice(part.price)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStockLevelBadge(part.stock)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {part.condition || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/parts/${part._id}/edit`}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="Edit part"
                                                        >
                                                            <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                        </Link>
                                                        <Link
                                                            href={`/admin/parts/${part._id}/view`}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="View details"
                                                        >
                                                            <Icon icon="mdi:eye" className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(part._id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Delete part"
                                                        >
                                                            <Icon icon="mdi:trash-can" className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && parts.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:package-variant-closed" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No parts found</h3>
                                        <p className="text-gray-500">
                                            {hasActiveFilters
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by adding your first part.'
                                            }
                                        </p>
                                        {!hasActiveFilters && (
                                            <Link
                                                href="/admin/parts/create"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 mt-4"
                                            >
                                                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                                                Add your first part
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {!loading && parts.length > 0 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={!pagination.hasPrevPage}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            disabled={!pagination.hasNextPage}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                                                <span className="font-medium">{pagination.totalPages}</span>
                                                {' '}({pagination.totalParts} total parts)
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={!pagination.hasPrevPage}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Icon icon="mdi:chevron-left" className="h-5 w-5" />
                                                </button>
                                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                    Page {pagination.currentPage} of {pagination.totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                                    disabled={!pagination.hasNextPage}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Icon icon="mdi:chevron-right" className="h-5 w-5" />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StockManagementPage;