// app/admin/jobboard/[jobId]/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';

function JobDetailsPage() {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancellationType, setCancellationType] = useState('admin_action');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [repairmen, setRepairmen] = useState([]);
    const [selectedRepairman, setSelectedRepairman] = useState('');
    const [assignmentReason, setAssignmentReason] = useState('');

    const params = useParams();
    const router = useRouter();
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (params.jobId) {
            fetchJobDetails();
        }
    }, [params.jobId]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/admin/job-board/${params.jobId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                setJob(data.data);
            }
        } catch (error) {
            handleError(error);
            toast.error('Failed to load job details');
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
                jobId: job._id,
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
                setSelectedRepairman('');
                setAssignmentReason('');
                fetchJobDetails();
            }
        } catch (error) {
            handleError(error);
            toast.error('Failed to assign job');
        }
    };

    const handleCancelJob = async () => {
        if (!cancelReason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        try {
            const { data } = await axiosInstance.post(`/admin/job-board/${job._id}/cancel`, {
                reason: cancelReason,
                cancellationType
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                toast.success('Job cancelled successfully');
                setShowCancelModal(false);
                setCancelReason('');
                fetchJobDetails();
            }
        } catch (error) {
            handleError(error);
            toast.error('Failed to cancel job');
        }
    };

    const updateJobStatus = async (newStatus) => {
        const reason = prompt('Enter reason for status change (optional):');

        try {
            const { data } = await axiosInstance.patch(`/admin/job-board/${job._id}/status`, {
                status: newStatus,
                reason: reason || `Status updated to ${newStatus}`
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                toast.success(`Job status updated to ${newStatus}`);
                fetchJobDetails();
            }
        } catch (error) {
            handleError(error);
            toast.error('Failed to update job status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'draft': 'bg-gray-100 text-gray-800 border-gray-300',
            'open': 'bg-primary-100 text-primary-800 border-primary-300',
            'offers_received': 'bg-cyan-100 text-cyan-800 border-cyan-300',
            'booked': 'bg-purple-100 text-purple-800 border-purple-300',
            'in_progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'completed': 'bg-green-100 text-green-800 border-green-300',
            'cancelled': 'bg-red-100 text-red-800 border-red-300',
            'expired': 'bg-orange-100 text-orange-800 border-orange-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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
        return new Date(dateString).toLocaleString('en-US', {
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

    const getActionColor = (action) => {
        const colors = {
            'job_created': 'text-primary-600 bg-primary-100',
            'job_published': 'text-green-600 bg-green-100',
            'offer_received': 'text-purple-600 bg-purple-100',
            'offer_accepted': 'text-green-600 bg-green-100',
            'job_assigned_manually': 'text-orange-600 bg-orange-100',
            'job_started': 'text-yellow-600 bg-yellow-100',
            'job_completed': 'text-green-600 bg-green-100',
            'job_cancelled': 'text-red-600 bg-red-100',
            'job_expired': 'text-orange-600 bg-orange-100',
            'status_changed': 'text-primary-600 bg-primary-100'
        };
        return colors[action] || 'text-gray-600 bg-gray-100';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="mdi:alert-circle" className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-gray-600">Job not found</p>
                    <Link href="/admin/job-board" className="text-primary-600 hover:underline mt-2 inline-block">
                        Back to Job Board
                    </Link>
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
                            href="/admin/job-board"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <Icon icon="mdi:arrow-left" className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
                            <p className="text-gray-600 mt-1">Complete job information and timeline</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {(job.status === 'open' || job.status === 'offers_received') && (
                            <button
                                onClick={() => {
                                    setShowAssignModal(true);
                                    fetchRepairmen();
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Icon icon="mdi:account-arrow-right" className="w-5 h-5" />
                                Assign Manually
                            </button>
                        )}
                        {job.status !== 'cancelled' && job.status !== 'completed' && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Icon icon="mdi:close-circle" className="w-5 h-5" />
                                Cancel Job
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Info Card */}
                        {console.log(job,"job details")}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{job.deviceInfo?.brand} {job.deviceInfo?.model || 'Untitled Job'}</h2>
                                    <p className="text-gray-500 mt-1">Job ID: {job._id}</p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
                                        {formatStatus(job.status)}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(job.urgency)}`}>
                                        {job.urgency?.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600">{job.description || 'No description provided'}</p>
                            </div>

                            {job.images && job.images.length > 0 && (
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Images</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {job.images.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img.url}
                                                alt={img.description || `Image ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Device Info */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Icon icon="mdi:cellphone" className="w-5 h-5" />
                                Device Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Brand</p>
                                    <p className="font-medium text-gray-900">{job.deviceInfo?.brand || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Model</p>
                                    <p className="font-medium text-gray-900">{job.deviceInfo?.model || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Color</p>
                                    <p className="font-medium text-gray-900">{job.deviceInfo?.color || 'N/A'}</p>
                                </div>
                               
                                <div>
                                    <p className="text-sm text-gray-500">Warranty Status</p>
                                    <p className="font-medium text-gray-900">{job.deviceInfo?.warrantyStatus || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Offers */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Icon icon="mdi:file-document-multiple" className="w-5 h-5" />
                                Offers ({job.offers?.length || 0})
                            </h3>
                            {job.offers && job.offers.length > 0 ? (
                                <div className="space-y-3">
                                    {job.offers.map((offer) => (
                                        <div key={offer._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <p className="font-semibold text-gray-900">
                                                            {offer.repairmanId?.name || 'Unknown Repairman'}
                                                        </p>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                            offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                            offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {offer.status?.toUpperCase()}
                                                        </span>
                                                        {job.selectedOffer?._id === offer._id && (
                                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                                SELECTED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-gray-900 font-medium">
                                                            {offer.pricing?.totalPrice} {offer.pricing?.currency || 'TRY'}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            {offer.estimatedTime?.value} {offer.estimatedTime?.unit}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            Warranty: {offer.warranty?.duration} days
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No offers received yet</p>
                            )}
                        </div>

                        {/* Activity Timeline */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Icon icon="mdi:timeline-clock" className="w-5 h-5" />
                                Activity Timeline
                            </h3>
                            <div className="relative">
                                {job.activityLog && job.activityLog.length > 0 ? (
                                    <div className="space-y-4">
                                        {job.activityLog.map((activity, index) => (
                                            <div key={index} className="relative pl-8 pb-4">
                                                {index !== job.activityLog.length - 1 && (
                                                    <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                                                )}
                                                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${getActionColor(activity.action)}`}>
                                                    <Icon icon={getActionIcon(activity.action)} className="w-4 h-4" />
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <p className="font-medium text-gray-900">
                                                            {activity.action?.replace(/_/g, ' ').toUpperCase()}
                                                        </p>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(activity.timestamp)}
                                                        </span>
                                                    </div>
                                                    {activity.performedBy && (
                                                        <p className="text-sm text-gray-600">
                                                            By: {activity.performedBy.name} ({activity.performedByRole})
                                                        </p>
                                                    )}
                                                    {activity.previousStatus && activity.newStatus && (
                                                        <p className="text-sm text-gray-600">
                                                            Status changed from <span className="font-medium">{formatStatus(activity.previousStatus)}</span> to <span className="font-medium">{formatStatus(activity.newStatus)}</span>
                                                        </p>
                                                    )}
                                                    {activity.reason && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Reason: {activity.reason}
                                                        </p>
                                                    )}
                                                    {activity.details && Object.keys(activity.details).length > 0 && (
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            {activity.details.repairmanName && (
                                                                <p>Assigned to: {activity.details.repairmanName}</p>
                                                            )}
                                                            {activity.details.cancellationType && (
                                                                <p>Type: {activity.details.cancellationType}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No activity recorded yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Icon icon="mdi:account" className="w-5 h-5" />
                                Customer
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">{job.customerId?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{job.customerId?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{job.customerId?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Icon icon="mdi:map-marker" className="w-5 h-5" />
                                Location
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-900">{job.location?.address || 'N/A'}</p>
                                <p className="text-sm text-gray-600">{job.location?.city || 'N/A'}</p>
                                {job.location?.district && (
                                    <p className="text-sm text-gray-600">{job.location.district}</p>
                                )}
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Icon icon="mdi:currency-usd" className="w-5 h-5" />
                                Budget
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Min:</span>
                                    <span className="font-medium">{job.budget?.min} {job.budget?.currency || 'TRY'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Max:</span>
                                    <span className="font-medium">{job.budget?.max} {job.budget?.currency || 'TRY'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Job Stats */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">View Count:</span>
                                    <span className="font-medium">{job.viewCount || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Notifications Sent:</span>
                                    <span className="font-medium">{job.notificationsSent || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium text-sm">{formatDate(job.createdAt)}</span>
                                </div>
                                {job.expiresAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Expires:</span>
                                        <span className="font-medium text-sm">{formatDate(job.expiresAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            updateJobStatus(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    defaultValue=""
                                >
                                    <option value="">Change Status</option>
                                    <option value="open">Open</option>
                                    <option value="booked">Booked</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-red-600">Cancel Job</h3>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cancellation Type
                            </label>
                            <select
                                value={cancellationType}
                                onChange={(e) => setCancellationType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="admin_action">Admin Action</option>
                                <option value="fraud">Fraudulent Job</option>
                                <option value="duplicate">Duplicate Job</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason *
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Explain why this job is being cancelled..."
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCancelJob}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Cancel Job
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Assign Job Manually</h3>
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
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
                                Job: <span className="font-medium">{job?.title}</span>
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
                                        {repairman.name} - {repairman.repairmanProfile?.rating || 0}★ ({repairman.repairmanProfile?.totalJobs || 0} jobs)
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

export default JobDetailsPage;