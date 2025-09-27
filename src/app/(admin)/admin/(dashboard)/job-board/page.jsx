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
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        hasNext: false,
        hasPrev: false
    });
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchJobs();
    }, [currentPage, searchTerm, filterStatus, filterPriority]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/admin/jobs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Process the API response to match component expectations
            const processedJobs = (data?.data?.jobs || [])?.map(job => ({
                ...job,
                // Map API fields to component expected fields
                title: job.title || job.jobTitle || 'Untitled Job',
                customerName: job.customer?.name || job.customerName || 'N/A',
                customerPhone: job.customer?.phone || job.customerPhone || 'N/A',
                repairmanName: job.repairman?.name || job.assignedRepairman?.name || 'Unassigned',
                location: job.address || job.location || 'N/A',
                createdDate: job.createdAt || job.dateCreated || new Date().toISOString(),
                priority: job.priority || 'medium',
                status: job.status || 'pending',
                estimatedCost: job.estimatedCost || job.cost || 0,
                description: job.description || job.details || '',
                category: job.category || job.serviceType || 'General',
                completionDate: job.completedAt || job.completionDate,
                isActive: job.status !== 'cancelled' && job.status !== 'deleted'
            }));

            // Apply client-side filtering
            let filteredJobs = processedJobs;

            // Apply search filter
            if (searchTerm) {
                filteredJobs = filteredJobs.filter(job =>
                    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.repairmanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.category.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Apply status filter
            if (filterStatus !== 'all') {
                filteredJobs = filteredJobs.filter(job => job.status === filterStatus);
            }

            // Apply priority filter
            if (filterPriority !== 'all') {
                filteredJobs = filteredJobs.filter(job => job.priority === filterPriority);
            }

            // Client-side pagination
            const pageSize = 10;
            const totalJobs = filteredJobs.length;
            const totalPages = Math.ceil(totalJobs / pageSize);
            const startIndex = (currentPage - 1) * pageSize;
            const paginatedJobs = filteredJobs.slice(startIndex, startIndex + pageSize);

            setJobs(paginatedJobs);
            setPagination({
                currentPage,
                totalPages,
                totalJobs,
                hasNext: currentPage < totalPages,
                hasPrev: currentPage > 1
            });

        } catch (error) {
            handleError(error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (job) => {
        console.log('Edit job:', job);
    };

    const handleDelete = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                await axiosInstance.delete(`/admin/jobs/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success('Job deleted successfully');
                setSubmitSuccess('Job deleted successfully!');
                setTimeout(() => setSubmitSuccess(''), 3000);
                fetchJobs();
            } catch (error) {
                console.error('Delete error:', error);
                setSubmitError('Failed to delete job. Please try again.');
                toast.error('Failed to delete job');
            }
        }
    };

    const updateJobStatus = async (jobId, newStatus) => {
        try {
            await axiosInstance.patch(`/admin/jobs/${jobId}/status`, {
                status: newStatus
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            toast.success(`Job status updated to ${newStatus}`);
            fetchJobs();
        } catch (error) {
            console.error('Update status error:', error);
            setSubmitError('Failed to update job status. Please try again.');
            toast.error('Failed to update job status');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'assigned':
                return 'bg-blue-100 text-blue-800';
            case 'in-progress':
                return 'bg-purple-100 text-purple-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-orange-100 text-orange-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                        {Math.min(currentPage * 10, pagination.totalJobs)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.totalJobs}</span> results
                </div>
                <div className="flex">{pages}</div>
            </div>
        );
    };

    // Calculate stats from current jobs data
    const totalJobsCount = pagination.totalJobs;
    const pendingJobsCount = jobs.filter(job => job.status === 'pending').length;
    const completedJobsCount = jobs.filter(job => job.status === 'completed').length;
    const inProgressJobsCount = jobs.filter(job => job.status === 'in-progress').length;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Job Board Management</h1>
                            <p className="text-gray-600 mt-1">Manage repair jobs and assignments</p>
                        </div>
                        <Link
                            href="/admin/jobs/create"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5" />
                            Create Job
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
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search jobs by title, customer, repairman, or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:filter" className="text-gray-400 w-5 h-5" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="assigned">Assigned</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:priority-high" className="text-gray-400 w-5 h-5" />
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Priority</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
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
                                                Customer Info
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assigned Repairman
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Priority & Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cost & Date
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
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {job.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {job.category}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            📍 {job.location}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{job.customerName}</div>
                                                    <div className="text-sm text-gray-500">{job.customerPhone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{job.repairmanName}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                                                            {job.priority?.toUpperCase()}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                                            {job.status?.replace('-', ' ').toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        ${job.estimatedCost}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(job.createdDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/jobs/${job._id}/view`}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="View job"
                                                        >
                                                            <Icon icon="mdi:eye" className="w-5 h-5" />
                                                        </Link>
                                                        <Link
                                                            href={`/admin/jobs/${job._id}/edit`}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="Edit job"
                                                        >
                                                            <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                        </Link>
                                                        {job.status === 'pending' && (
                                                            <button
                                                                onClick={() => updateJobStatus(job._id, 'assigned')}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                title="Assign job"
                                                            >
                                                                <Icon icon="mdi:account-check" className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(job._id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Delete job"
                                                        >
                                                            <Icon icon="mdi:trash-can" className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && jobs.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:briefcase" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by creating your first job.'
                                            }
                                        </p>
                                        {(!searchTerm && filterStatus === 'all' && filterPriority === 'all') && (
                                            <Link
                                                href="/admin/jobs/create"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 mt-4"
                                            >
                                                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                                                Create your first job
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
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:briefcase" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : totalJobsCount}
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
                                <p className="text-sm font-medium text-gray-500">Pending Jobs</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : pendingJobsCount}
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
                                    {loading ? '...' : inProgressJobsCount}
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
                                <p className="text-sm font-medium text-gray-500">Completed Jobs</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : completedJobsCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JobBoardPage;    