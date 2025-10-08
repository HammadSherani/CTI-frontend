"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';

function JobBoardPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterUrgency, setFilterUrgency] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        hasMore: false
    });
    const [stats, setStats] = useState({});
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [repairmen, setRepairmen] = useState([]);
    const [selectedRepairman, setSelectedRepairman] = useState('');
    const [assignmentReason, setAssignmentReason] = useState('');
    
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchJobs();
    }, [currentPage, searchTerm, filterStatus, filterUrgency]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus) params.append('status', filterStatus);
            if (filterUrgency) params.append('urgency', filterUrgency);

            const { data } = await axiosInstance.get(`/admin/job-board?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                setJobs(data.data.jobs);
                setPagination(data.data.pagination);
                setStats(data.data.stats);
            }

        } catch (error) {
            handleError(error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRepairmen = async () => {
        try {
            const { data } = await axiosInstance.get('/admin/users?role=repairman&status=approved', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRepairmen(data.data || []);
        } catch (error) {
            console.error('Error fetching repairmen:', error);
            toast.error('Failed to load repairmen');
        }
    };

    const handleAssignJob = async () => {
        if (!selectedRepairman) {
            toast.error('Please select a repairman');
            return;
        }

        try {
            const { data } = await axiosInstance.post('/admin/job-board/assign', {
                jobId: selectedJob._id,
                repairmanId: selectedRepairman,
                reason: assignmentReason
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                toast.success('Job assigned successfully');
                setShowAssignModal(false);
                setSelectedJob(null);
                setSelectedRepairman('');
                setAssignmentReason('');
                fetchJobs();
            }
        } catch (error) {
            handleError(error);
            toast.error('Failed to assign job');
        }
    };

    const handleCancelJob = async (jobId) => {
        const reason = prompt('Enter cancellation reason:');
        if (!reason) return;

        const cancellationType = prompt('Cancellation type (fraud/duplicate/other):') || 'other';

        try {
            const { data } = await axiosInstance.post(`/admin/job-board/${jobId}/cancel`, {
                reason,
                cancellationType
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                toast.success('Job cancelled successfully');
                fetchJobs();
            }
        } catch (error) {
            handleError(error);
            toast.error('Failed to cancel job');
        }
    };

    const updateJobStatus = async (jobId, newStatus) => {
        const reason = prompt('Enter reason for status change (optional):');
        
        try {
            const { data } = await axiosInstance.patch(`/admin/job-board/${jobId}/status`, {
                status: newStatus,
                reason: reason || `Status updated to ${newStatus}`
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (data.success) {
                toast.success(`Job status updated to ${newStatus}`);
                fetchJobs();
            }
        } catch (error) {
            handleError(error);
            toast.error('Failed to update job status');
        }
    };

    const openAssignModal = (job) => {
        setSelectedJob(job);
        setShowAssignModal(true);
        fetchRepairmen();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getStatusColor = (status) => {
        const colors = {
            'draft': 'bg-gray-100 text-gray-800',
            'open': 'bg-primary-100 text-primary-800',
            'offers_received': 'bg-cyan-100 text-cyan-800',
            'booked': 'bg-purple-100 text-purple-800',
            'in_progress': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'expired': 'bg-orange-100 text-orange-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getUrgencyColor = (urgency) => {
        const colors = {
            'low': 'bg-green-100 text-green-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'high': 'bg-orange-100 text-orange-800',
            'urgent': 'bg-red-100 text-red-800'
        };
        return colors[urgency] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatStatus = (status) => {
        return status?.replace(/_/g, ' ').toUpperCase();
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
                disabled={currentPage === 1}
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
                disabled={currentPage === pagination.totalPages}
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
                        {Math.min(currentPage * 10, pagination.totalJobs)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.totalJobs}</span> results
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
                            <h1 className="text-3xl font-bold text-gray-900">Job Board Management</h1>
                            <p className="text-gray-600 mt-1">Monitor and manage all repair jobs</p>
                        </div>
                        <Link
                            href="/admin/job-board/statistics"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Icon icon="mdi:chart-line" className="w-5 h-5" />
                            View Statistics
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:briefcase" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : pagination.totalJobs || 0}
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
                                <p className="text-sm font-medium text-gray-500">Open Jobs</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : (stats.open || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:progress-clock" className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">In Progress</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : (stats.in_progress || 0)}
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
                                <p className="text-sm font-medium text-gray-500">Completed</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : (stats.completed || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by title, description, customer..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="open">Open</option>
                                <option value="offers_received">Offers Received</option>
                                <option value="booked">Booked</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>

                        {/* Urgency Filter */}
                        <div>
                            <select
                                value={filterUrgency}
                                onChange={(e) => {
                                    setFilterUrgency(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Urgency</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Jobs Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Loading jobs...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Job Details
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Device
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Offers
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
                                        {jobs?.map((job) => (
                                            <tr key={job._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {job.title || 'Untitled Job'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(job.createdAt)}
                                                        </span>
                                                        <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                                                            {job.urgency?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">
                                                            {job.customerId?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {job.customerId?.phone || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">
                                                            {job.deviceInfo?.brand || 'N/A'}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {job.deviceInfo?.model || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <Icon icon="mdi:file-document-outline" className="w-4 h-4 text-gray-400 mr-1" />
                                                        <span className="text-sm text-gray-900">
                                                            {job.offers?.length || 0} offers
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                                        {formatStatus(job.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/job-board/${job._id}`}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Icon icon="mdi:eye" className="w-5 h-5" />
                                                        </Link>

                                                        {(job.status === 'open' || job.status === 'offers_received') && (
                                                            <button
                                                                onClick={() => openAssignModal(job)}
                                                                className="text-green-600 hover:text-green-900 transition-colors"
                                                                title="Assign Job"
                                                            >
                                                                <Icon icon="mdi:account-arrow-right" className="w-5 h-5" />
                                                            </button>
                                                        )}

                                                        {job.status !== 'cancelled' && job.status !== 'completed' && (
                                                            <button
                                                                onClick={() => handleCancelJob(job._id)}
                                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                                title="Cancel Job"
                                                            >
                                                                <Icon icon="mdi:close-circle" className="w-5 h-5" />
                                                            </button>
                                                        )}

                                                        {/* Status Update Dropdown */}
                                                        <select
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    updateJobStatus(job._id, e.target.value);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                            className="text-xs border border-gray-300 rounded px-2 py-1"
                                                            defaultValue=""
                                                        >
                                                            <option value="">Change Status</option>
                                                            <option value="open">Open</option>
                                                            <option value="booked">Booked</option>
                                                            <option value="in_progress">In Progress</option>
                                                            <option value="completed">Completed</option>
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && jobs.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:briefcase-off" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterStatus || filterUrgency
                                                ? 'Try adjusting your filters.'
                                                : 'No jobs have been posted yet.'
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

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Assign Job Manually</h3>
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setSelectedJob(null);
                                    setSelectedRepairman('');
                                    setAssignmentReason('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Job: <span className="font-medium">{selectedJob?.title}</span>
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Repairman *
                            </label>
                            <select
                                value={selectedRepairman}
                                onChange={(e) => setSelectedRepairman(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Choose a repairman</option>
                                {repairmen.map((repairman) => (
                                    <option key={repairman._id} value={repairman._id}>
                                        {repairman.name} - {repairman.repairmanProfile?.rating || 0}★
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Manual Assignment
                            </label>
                            <textarea
                                value={assignmentReason}
                                onChange={(e) => setAssignmentReason(e.target.value)}
                                placeholder="Why are you assigning this manually?"
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setSelectedJob(null);
                                    setSelectedRepairman('');
                                    setAssignmentReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignJob}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                Assign Job
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobBoardPage;