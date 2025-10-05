// app/admin/jobboard/statistics/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';

function JobStatisticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchStatistics();
    }, [dateRange.startDate, dateRange.endDate]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const { data } = await axiosInstance.get(`/admin/jobboard/statistics?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            handleError(error);
            toast.error('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionIcon = (action) => {
        const icons = {
            'job_created': 'mdi:file-document-plus',
            'job_published': 'mdi:send',
            'offer_received': 'mdi:email-receive',
            'offer_accepted': 'mdi:check-circle',
            'job_assigned_manually': 'mdi:account-arrow-right',
            'job_started': 'mdi:play-circle',
            'job_completed': 'mdi:check-all',
            'job_cancelled': 'mdi:close-circle',
            'job_expired': 'mdi:clock-alert',
            'status_changed': 'mdi:swap-horizontal'
        };
        return icons[action] || 'mdi:circle';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading statistics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/jobboard"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <Icon icon="mdi:arrow-left" className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Job Statistics</h1>
                            <p className="text-gray-600 mt-1">Overview of all job activities</p>
                        </div>
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Clear Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:briefcase" className="w-10 h-10 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats?.totalJobs || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:file-document-multiple" className="w-10 h-10 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Offers</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats?.totalOffers || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:chart-line" className="w-10 h-10 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Avg Offers/Job</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats?.avgOffersPerJob || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:alert-circle" className="w-10 h-10 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">No Offers</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats?.jobsWithNoOffers || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Status Breakdown */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Icon icon="mdi:chart-bar" className="w-5 h-5" />
                            Status Breakdown
                        </h3>
                        <div className="space-y-3">
                            {stats?.statusStats && Object.entries(stats.statusStats).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-3 h-3 rounded-full ${
                                            status === 'completed' ? 'bg-green-500' :
                                            status === 'in_progress' ? 'bg-yellow-500' :
                                            status === 'cancelled' ? 'bg-red-500' :
                                            status === 'open' ? 'bg-primary-500' :
                                            'bg-gray-500'
                                        }`}></span>
                                        <span className="font-medium text-gray-900 capitalize">
                                            {status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Urgency Breakdown */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Icon icon="mdi:fire" className="w-5 h-5" />
                            Urgency Breakdown
                        </h3>
                        <div className="space-y-3">
                            {stats?.urgencyStats && Object.entries(stats.urgencyStats).map(([urgency, count]) => (
                                <div key={urgency} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Icon icon={
                                            urgency === 'urgent' ? 'mdi:fire' :
                                            urgency === 'high' ? 'mdi:alert' :
                                            urgency === 'medium' ? 'mdi:clock' :
                                            'mdi:information'
                                        } className={`w-5 h-5 ${
                                            urgency === 'urgent' ? 'text-red-600' :
                                            urgency === 'high' ? 'text-orange-600' :
                                            urgency === 'medium' ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`} />
                                        <span className="font-medium text-gray-900 capitalize">{urgency}</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Icon icon="mdi:timeline-clock" className="w-5 h-5" />
                        Recent Activity (Last 10)
                    </h3>
                    {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                        activity.action === 'job_completed' ? 'bg-green-100 text-green-600' :
                                        activity.action === 'job_cancelled' ? 'bg-red-100 text-red-600' :
                                        activity.action === 'job_assigned_manually' ? 'bg-orange-100 text-orange-600' :
                                        'bg-primary-100 text-primary-600'
                                    }`}>
                                        <Icon icon={getActionIcon(activity.action)} className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {activity.action?.replace(/_/g, ' ').toUpperCase()}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Job: <Link href={`/admin/jobboard/${activity.jobId}`} className="text-primary-600 hover:underline">
                                                        {activity.jobTitle || 'View Job'}
                                                    </Link>
                                                </p>
                                                {activity.performedBy && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        By: {activity.performedBy.name} ({activity.performedByRole})
                                                    </p>
                                                )}
                                                {activity.reason && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Reason: {activity.reason}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 flex-shrink-0">
                                                {formatDate(activity.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
}



export default JobStatisticsPage;