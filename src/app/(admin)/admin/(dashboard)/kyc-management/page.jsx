"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';

function KycManagement() {
    const [repairmen, setRepairmen] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
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
        fetchKycData();
    }, [currentPage, searchTerm, filterStatus]);

    const fetchKycData = async () => {
        try {
            setLoading(true);
            
            // Build query parameters
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm,
                kycStatus: filterStatus !== 'all' ? filterStatus : ''
            };

            const { data } = await axiosInstance.get('/admin/repairman/new-repairmans', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params
            });

            const processedRepairmen = (data?.data || []).map(repairman => ({
                ...repairman,
                fullName: repairman.repairmanProfile?.fullName || repairman.name || 'N/A',
                shopName: repairman.repairmanProfile?.shopName || 'N/A',
                city: repairman.repairmanProfile?.city || 'N/A',
                mobileNumber: repairman.repairmanProfile?.mobileNumber || repairman.phone || 'N/A',
                kycStatus: repairman.repairmanProfile?.kycStatus || 'pending',
                profilePhoto: repairman.repairmanProfile?.profilePhoto || '',
                specializations: repairman.repairmanProfile?.specializations || [],
            }));

            setRepairmen(processedRepairmen);
            
            // Set pagination from server response
            if (data.pagination) {
                setPagination(data.pagination);
            }

        } catch (error) {
            handleError(error);
            setRepairmen([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKycAction = async (repairmanId, action) => {
        try {
            await axiosInstance.patch(`/admin/repairman/${repairmanId}/kyc-status`, {
                kycStatus: action
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            toast.success(`KYC ${action === 'approved' ? 'approved' : 'rejected'} successfully`);
            setShowModal(false);
            setSelectedRepairman(null);
            fetchKycData();
        } catch (error) {
            handleError(error);
            toast.error(`Failed to ${action} KYC`);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'mdi:clock-outline' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', icon: 'mdi:check-circle' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: 'mdi:close-circle' }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon icon={config.icon} className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
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

    // Stats
    const pendingCount = repairmen.filter(r => r.kycStatus === 'pending').length;
    const approvedCount = repairmen.filter(r => r.kycStatus === 'approved').length;
    const rejectedCount = repairmen.filter(r => r.kycStatus === 'rejected').length;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">KYC Management</h1>
                            <p className="text-gray-600 mt-1">Review and verify repairman KYC documents</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:account-group" className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : pagination.totalRepairmen}
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
                                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : pendingCount}
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
                                    {loading ? '...' : approvedCount}
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
                                    {loading ? '...' : rejectedCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or shop..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:filter" className="text-gray-400 w-5 h-5" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* KYC Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Loading KYC applications...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Repairman Info
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Shop & Location
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Specializations
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                KYC Status
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
                                                        {repairman.profilePhoto ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full mr-3"
                                                                src={repairman.profilePhoto}
                                                                alt={repairman.fullName}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                                <Icon icon="mdi:account" className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {repairman.fullName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ID: {repairman._id.slice(-8)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{repairman.email}</div>
                                                    <div className="text-sm text-gray-500">{repairman.mobileNumber}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{repairman.shopName}</div>
                                                    <div className="text-sm text-gray-500">{repairman.city}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {repairman?.specializations?.slice(0, 2).map((spec, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                                                            >
                                                                {spec}
                                                            </span>
                                                        ))}
                                                        {repairman?.specializations?.length > 2 && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                +{repairman.specializations.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(repairman.kycStatus)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        href={`/admin/kyc-management/${repairman._id}/details`}
                                                        className="text-primary-600 hover:text-primary-900 font-medium text-sm flex items-center gap-1"
                                                    >
                                                        <Icon icon="mdi:eye" className="w-4 h-4" />
                                                        Review Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && repairmen.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:file-document-outline" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No KYC applications found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterStatus !== 'all'
                                                ? 'Try adjusting your search or filters.'
                                                : 'There are no KYC applications to review at the moment.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            {!loading && renderPagination()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default KycManagement;