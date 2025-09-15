"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';

function AdminRepairmanPage() {
    const [repairmen, setRepairmen] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRepairmen: 0,
        hasNext: false,
        hasPrev: false
    });
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchRepairmen();
    }, [currentPage, searchTerm, filterStatus]);

    const fetchRepairmen = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/admin/repairman', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Process the API response to match component expectations
            const processedRepairmen = (data?.data?.repairmans || [])?.map(repairman => ({
                ...repairman,
                // Map API fields to component expected fields
                name: repairman.fullName || repairman.name || 'N/A',
                phone: repairman.mobileNumber || repairman.whatsappNumber || repairman.phone || 'N/A',
                totalRepairs: repairman.totalJobs || 0,
                isActive: repairman.status === 'active' || repairman.status === 'approved',
                city: repairman.repairmanProfile?.city || 'N/A',
                specializations: repairman.specializations || [],
                profilePhoto: repairman.repairmanProfile?.profilePhoto || '',
                shopName: repairman.repairmanProfile?.shopName || ''
            }));

            // Apply client-side filtering
            let filteredRepairmen = processedRepairmen;

            // Apply search filter
            if (searchTerm) {
                filteredRepairmen = filteredRepairmen.filter(repairman =>
                    repairman.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    repairman.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    repairman.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    repairman.shopName.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Apply status filter
            if (filterStatus !== 'all') {
                filteredRepairmen = filteredRepairmen.filter(repairman =>
                    filterStatus === 'active' ? repairman.isActive : !repairman.isActive
                );
            }

            // Client-side pagination
            const pageSize = 10;
            const totalRepairmen = filteredRepairmen.length;
            const totalPages = Math.ceil(totalRepairmen / pageSize);
            const startIndex = (currentPage - 1) * pageSize;
            const paginatedRepairmen = filteredRepairmen.slice(startIndex, startIndex + pageSize);

            setRepairmen(paginatedRepairmen);
            setPagination({
                currentPage,
                totalPages,
                totalRepairmen,
                hasNext: currentPage < totalPages,
                hasPrev: currentPage > 1
            });

        } catch (error) {
            handleError(error);
            setRepairmen([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (repairman) => {
        console.log('Edit repairman:', repairman);
    };

    const handleDelete = async (repairmanId) => {
        if (window.confirm('Are you sure you want to delete this repairman?')) {
            try {
                // Replace with actual delete API call
                await axiosInstance.delete(`/admin/repairman/${repairmanId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success('Repairman deleted successfully');
                setSubmitSuccess('Repairman deleted successfully!');
                setTimeout(() => setSubmitSuccess(''), 3000);
                fetchRepairmen();
            } catch (error) {
                console.error('Delete error:', error);
                setSubmitError('Failed to delete repairman. Please try again.');
                toast.error('Failed to delete repairman');
            }
        }
    };

    const toggleActive = async (repairmanId) => {
        try {
            const repairman = repairmen.find(r => r._id === repairmanId);
            const newStatus = repairman.isActive ? 'inactive' : 'active';
            
            // Replace with actual API call to update status
            await axiosInstance.patch(`/admin/repairman/${repairmanId}/status`, {
                status: newStatus
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            toast.success(`Repairman status updated to ${newStatus}`);
            fetchRepairmen();
        } catch (error) {
            console.error('Toggle active error:', error);
            setSubmitError('Failed to update repairman status. Please try again.');
            toast.error('Failed to update repairman status');
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
                        {Math.min(currentPage * 10, pagination.totalRepairmen)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.totalRepairmen}</span> results
                </div>
                <div className="flex">{pages}</div>
            </div>
        );
    };

    // Calculate stats from current repairmen data
    const totalRepairmenCount = pagination.totalRepairmen;
    const activeRepairmenCount = repairmen.filter(repairman => repairman.isActive).length;
    const inactiveRepairmenCount = repairmen.filter(repairman => !repairman.isActive).length;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Repairman Management</h1>
                            <p className="text-gray-600 mt-1">Manage repair technicians</p>
                        </div>
                        <Link
                            href="/admin/repairman/create"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5" />
                            Add Repairman
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
                                    placeholder="Search repairmen by name, email, phone, or shop..."
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
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Repairmen</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Repairmen Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Loading repairmen...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name & Shop
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact Info
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Specializations
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Jobs
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
                                        {repairmen?.map((repairman) => (
                                            <tr key={repairman._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        {repairman.profilePhoto && (
                                                            <img
                                                                className="h-10 w-10 rounded-full mr-3"
                                                                src={repairman.profilePhoto}
                                                                alt={repairman.name}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {repairman.name}
                                                            </div>
                                                            {repairman.shopName && (
                                                                <div className="text-sm text-gray-500">
                                                                    {repairman.shopName}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{repairman.email}</div>
                                                    <div className="text-sm text-gray-500">{repairman.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500">{repairman.city}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {repairman?.specializations?.map((spec, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                                            >
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {repairman.totalRepairs} jobs
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleActive(repairman._id)}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            repairman.isActive
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        } transition-colors`}
                                                    >
                                                        <Icon
                                                            icon={repairman.isActive ? 'mdi:eye' : 'mdi:eye-off'}
                                                            className="w-3 h-3 mr-1"
                                                        />
                                                        {repairman.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/repairman/${repairman._id}/edit`}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="Edit repairman"
                                                        >
                                                            <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(repairman._id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Delete repairman"
                                                        >
                                                            <Icon icon="mdi:trash-can" className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && repairmen.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:account" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No repairmen found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterStatus !== 'all'
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by adding your first repairman.'
                                            }
                                        </p>
                                        {(!searchTerm && filterStatus === 'all') && (
                                            <Link
                                                href="/admin/repairman/create"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 mt-4"
                                            >
                                                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                                                Add your first repairman
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
                                <Icon icon="mdi:account" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Repairmen</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : totalRepairmenCount}
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
                                <p className="text-sm font-medium text-gray-500">Active Repairmen</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : activeRepairmenCount}
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
                                <p className="text-sm font-medium text-gray-500">Inactive Repairmen</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : inactiveRepairmenCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminRepairmanPage;