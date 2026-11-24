"use client"

import axiosInstance from '@/config/axiosInstance';
import {Link} from '@/i18n/navigation';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';


const CATEGORY_OPTIONS = [
    ['payment_issue', 'Payment issue'], ['quality_of_work', 'Quality of work'], ['service_not_provided', 'Service not provided'],
    ['damaged_property', 'Damaged property'], ['unprofessional_behavior', 'Unprofessional behavior'], ['cancellation_issue', 'Cancellation issue'],
    ['unfair_rating', 'Unfair rating'], ['late_payment', 'Late payment'], ['rude_behavior', 'Rude behavior'],
    ['cancellation_after_arrival', 'Cancellation after arrival'], ['fake_request', 'Fake request'], ['other', 'Other']
];
const RESOLUTION_LABELS = {
    refund_full: 'Full refund', refund_partial: 'Partial refund', mutual_agreement: 'Mutual agreement',
    pay_repairman: 'Paid repairman', no_action: 'No action'
};
const label = (v) => String(v || '').replace(/_/g, ' ');

const AdminDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        under_review: 0,
        resolving: 0,
        resolved: 0,
        closed: 0,
        overdue: 0,
        escalated: 0
    });
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalDisputes: 0,
        limit: 20
    });
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        category: '',
        attention: '',
        search: '',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    // Search waits until typing stops (one request instead of one per key)
    useEffect(() => {
        const t = setTimeout(() => {
            setFilters((prev) => (prev.search === searchText.trim() ? prev : { ...prev, search: searchText.trim(), page: 1 }));
        }, 400);
        return () => clearTimeout(t);
    }, [searchText]);

    const { token } = useSelector((state) => state.auth);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.category) params.append('category', filters.category);
            if (filters.attention) params.append('attention', filters.attention);
            if (filters.search) params.append('search', filters.search);
            params.append('page', filters.page);
            params.append('limit', filters.limit);
            params.append('sortBy', filters.sortBy);
            params.append('sortOrder', filters.sortOrder);

            const { data } = await axiosInstance.get(`/disputes/admin/get-all-disputes?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                setDisputes(data.data || []);
                setStats(data.stats || {});
                setPagination(data.pagination || {});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch disputes');
            console.error('Error fetching disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            open: 'bg-yellow-100 text-yellow-800',
            under_review: 'bg-blue-100 text-blue-800',
            resolving: 'bg-purple-100 text-purple-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityBadge = (priority) => {
        const priorityColors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-red-100 text-red-800'
        };
        return priorityColors[priority] || 'bg-gray-100 text-gray-800';
    };


    if (loading && disputes.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
                    <p className="text-gray-600 mt-2">Manage and resolve booking disputes</p>
                </div>

                {/* Stats Cards (click to filter) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                    {[
                        { key: 'total', label: 'Total', color: 'text-gray-900', set: { status: '', attention: '' } },
                        { key: 'open', label: 'Open', color: 'text-yellow-600', set: { status: 'open', attention: '' } },
                        { key: 'under_review', label: 'Under review', color: 'text-blue-600', set: { status: 'under_review', attention: '' } },
                        { key: 'overdue', label: 'Overdue', color: 'text-red-600', set: { status: '', attention: 'overdue' } },
                        { key: 'escalated', label: 'Escalated', color: 'text-orange-600', set: { status: '', attention: 'escalated' } },
                        { key: 'resolving', label: 'Resolving', color: 'text-purple-600', set: { status: 'resolving', attention: '' } },
                        { key: 'resolved', label: 'Resolved', color: 'text-green-600', set: { status: 'resolved', attention: '' } },
                    ].map((c) => (
                        <button
                            key={c.key}
                            type="button"
                            onClick={() => setFilters((prev) => ({ ...prev, ...c.set, page: 1 }))}
                            className="bg-white rounded-lg shadow p-4 text-left hover:ring-2 hover:ring-primary-200 transition"
                        >
                            <div className="text-sm text-gray-600">{c.label}</div>
                            <div className={`text-2xl font-bold ${c.color}`}>{stats[c.key] ?? 0}</div>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block  text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search by ID or description..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="open">Open</option>
                                <option value="under_review">Under Review</option>
                                <option value="resolving">Resolving</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {/* Needs attention */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Needs attention
                            </label>
                            <select
                                value={filters.attention}
                                onChange={(e) => handleFilterChange('attention', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Any</option>
                                <option value="overdue">Past resolution deadline</option>
                                <option value="no_response">Other side did not answer</option>
                                <option value="escalated">Escalated</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">All Priority</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div> */}

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">All Categories</option>
                                {CATEGORY_OPTIONS.map(([value, text]) => (
                                    <option key={value} value={value}>{text}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {(filters.status || filters.priority || filters.category || filters.search || filters.attention) && (
                        <div className="mt-4">
                            <button
                                onClick={() => { setSearchText(''); setFilters({
                                    status: '',
                                    priority: '',
                                    category: '',
                                    attention: '',
                                    search: '',
                                    page: 1,
                                    limit: 20,
                                    sortBy: 'createdAt',
                                    sortOrder: 'desc'
                                }); }}
                                className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Disputes Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dispute ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Raised By
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Against
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Outcome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : disputes.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-lg font-medium">No disputes found</p>
                                                <p className="text-sm">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    disputes.map((dispute) => (
                                        <tr key={dispute._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {dispute.disputeId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {dispute.raisedBy?.userId?.name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {dispute.raisedBy?.userType}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {dispute.againstUser?.userId?.name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {dispute.againstUser?.userType}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {label(dispute.category)}
                                                </span>
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(dispute.priority)}`}>
                                                    {dispute.priority?.toUpperCase()}
                                                </span>
                                            </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(dispute.status)}`}>
                                                    {label(dispute.status).toUpperCase()}
                                                </span>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {dispute.isOverdue && <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-red-100 text-red-700">Overdue</span>}
                                                    {dispute.noResponse && <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-orange-100 text-orange-700">No answer</span>}
                                                    {dispute.isEscalated && !dispute.isOverdue && <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-orange-100 text-orange-700">Escalated</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {dispute.resolution?.resolutionType ? (
                                                    <>
                                                        <div className="text-gray-900">{RESOLUTION_LABELS[dispute.resolution.resolutionType] || label(dispute.resolution.resolutionType)}</div>
                                                        {dispute.resolution.refundAmount > 0 && (
                                                            <div className="text-xs text-green-700">₺{dispute.resolution.refundAmount} refunded</div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-500">
                                                        {dispute.deadlines?.resolutionDeadline ? `Due ${new Date(dispute.deadlines.resolutionDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '—'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(dispute.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link href={`/admin/disputes/${dispute._id}`}>
                                                    <button

                                                        className="text-primary-600 hover:text-primary-900"
                                                    >
                                                        View Details
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                                        <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalDisputes} total disputes)
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        {[...Array(pagination.totalPages)].map((_, index) => (
                                            <button
                                                key={index + 1}
                                                onClick={() => handlePageChange(index + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.currentPage === index + 1
                                                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDisputes;