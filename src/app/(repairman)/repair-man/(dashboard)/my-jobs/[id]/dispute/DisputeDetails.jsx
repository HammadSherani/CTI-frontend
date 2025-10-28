'use client'

import StatusBadge from '@/components/partials/customer/Offer/StatusBadge';
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const DisputeDetails = ({ dispute, job, onEvidenceUploaded }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [submittingResponse, setSubmittingResponse] = useState(false);
    const { token } = useSelector((state) => state.auth);

    if (!dispute) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCategory = (category) => {
        return category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatCurrency = (amount, currency = 'PKR') => {
        return `${currency} ${amount?.toLocaleString() || 0}`;
    };

    const currencySymbol = 'PKR';

    // Extract job data
    const jobInfo = job?.jobInfo || {};
    const customer = job?.customer || {};
    const bookingDetails = job?.bookingDetails || {};
    const deviceInfo = jobInfo.deviceInfo || {};

    // Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        const maxSize = 5 * 1024 * 1024;
        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                toast.error(`${file.name} is too large. Max size is 5MB`);
                return false;
            }
            return true;
        });

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        const validTypedFiles = validFiles.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`${file.name} is not a supported file type`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validTypedFiles]);

        validTypedFiles.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => [...prev, { name: file.name, url: reader.result, type: 'image' }]);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviews(prev => [...prev, { name: file.name, url: null, type: 'pdf' }]);
            }
        });
    };

    // Remove selected file
    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Upload evidence
    const handleUploadEvidence = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Please select at least one file to upload');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('evidence', file);
            });

            const { data } = await axiosInstance.post(
                `/disputes/${dispute._id}/evidence`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (data.success) {
                toast.success('Evidence uploaded successfully');
                setSelectedFiles([]);
                setPreviews([]);
                setShowUploadModal(false);
                
                if (onEvidenceUploaded) {
                    onEvidenceUploaded();
                }
            }
        } catch (error) {
            handleError(error);
        } finally {
            setUploading(false);
        }
    };

    // Submit response
    const handleSubmitResponse = async () => {
        if (!responseMessage.trim()) {
            toast.error('Please enter a response message');
            return;
        }

        if (responseMessage.trim().length < 10) {
            toast.error('Response message must be at least 10 characters');
            return;
        }

        setSubmittingResponse(true);

        try {
            const { data } = await axiosInstance.post(
                `/disputes/${dispute._id}/response`,
                {
                    message: responseMessage.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (data.success) {
                toast.success('Response submitted successfully');
                setResponseMessage('');
                setShowResponseModal(false);
                
                if (onEvidenceUploaded) {
                    onEvidenceUploaded();
                }
            }
        } catch (error) {
            handleError(error);
        } finally {
            setSubmittingResponse(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Main Dispute Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-primary-50 border-b border-primary-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-primary-900">Dispute Information</h3>
                        <div className="flex items-center space-x-2">
                            <StatusBadge status={dispute.status} />
                            <StatusBadge status={dispute.priority} />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dispute Info */}
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm font-medium text-gray-500">Dispute ID</span>
                                <p className="text-base font-semibold text-gray-900 mt-1">{dispute.disputeId}</p>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-gray-500">Category</span>
                                <p className="text-base text-gray-800 mt-1 capitalize">{formatCategory(dispute.category)}</p>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-gray-500">Payment Status</span>
                                <span className="inline-block mt-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold border border-orange-200">
                                    {dispute.paymentStatus?.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-gray-500">Escalated</span>
                                <div className="flex items-center mt-1">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${dispute.isEscalated ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-gray-800">{dispute.isEscalated ? 'Yes' : 'No'}</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-gray-500">Chat</span>
                                <div className="flex items-center mt-1">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${dispute.chatEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-gray-800">{dispute.chatEnabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Parties Info */}
                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <span className="text-sm font-medium text-blue-900 flex items-center mb-2">
                                    <Icon icon="heroicons:user" className="w-4 h-4 mr-1" />
                                    Raised By
                                </span>
                                <p className="text-base text-blue-900 font-semibold">
                                    {dispute.raisedBy.userId.name}
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    {dispute.raisedBy.userId.email}
                                </p>
                                <p className="text-xs text-blue-700">
                                    {dispute.raisedBy.userId.phone}
                                </p>
                                <span className="inline-block mt-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium">
                                    {dispute.raisedBy.userType}
                                </span>
                            </div>

                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                <span className="text-sm font-medium text-red-900 flex items-center mb-2">
                                    <Icon icon="heroicons:user" className="w-4 h-4 mr-1" />
                                    Against User
                                </span>
                                <p className="text-base text-red-900 font-semibold">
                                    {dispute.againstUser.userId.name}
                                </p>
                                <p className="text-xs text-red-700 mt-1">
                                    {dispute.againstUser.userId.email}
                                </p>
                                <p className="text-xs text-red-700">
                                    {dispute.againstUser.userId.phone}
                                </p>
                                <span className="inline-block mt-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium">
                                    {dispute.againstUser.userType}
                                </span>
                            </div>

                            {dispute.resolution?.refundAmount > 0 && (
                                <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                                    <span className="text-sm font-medium text-primary-900">Refund Amount</span>
                                    <p className="text-2xl font-bold text-primary-600 mt-1">
                                        {currencySymbol} {dispute.resolution.refundAmount}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {dispute.description && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-500">Description</span>
                            <p className="text-gray-800 mt-2 leading-relaxed">
                                {dispute.description}
                            </p>
                        </div>
                    )}

                    {/* Deadlines */}
                    {dispute.deadlines && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-500 mb-3 block">Important Deadlines</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dispute.deadlines.responseDeadline && (
                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <div className="flex items-start">
                                            <Icon icon="heroicons:clock" className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                                            <div>
                                                <p className="text-xs font-semibold text-yellow-900">Response Deadline</p>
                                                <p className="text-sm text-yellow-800 mt-1">
                                                    {formatDate(dispute.deadlines.responseDeadline)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {dispute.deadlines.resolutionDeadline && (
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                        <div className="flex items-start">
                                            <Icon icon="heroicons:clock" className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                                            <div>
                                                <p className="text-xs font-semibold text-red-900">Resolution Deadline</p>
                                                <p className="text-sm text-red-800 mt-1">
                                                    {formatDate(dispute.deadlines.resolutionDeadline)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowResponseModal(true)}
                                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                            >
                                <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4 mr-2" />
                                Add Response
                            </button>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                                <Icon icon="heroicons:arrow-up-tray" className="w-4 h-4 mr-2" />
                                Upload Evidence
                            </button>
                        </div>
                    </div>

                    {/* Responses */}
                    {dispute.responses && dispute.responses.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-500">Responses</span>
                                <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-semibold">
                                    {dispute.responses.length} {dispute.responses.length === 1 ? 'Response' : 'Responses'}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {dispute.responses.map((response, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center mr-3">
                                                    <Icon icon="heroicons:user" className="w-4 h-4 text-primary-700" />
                                                </div>
                                                <div>
                                                    <p className="text-sm capitalize font-semibold text-gray-900">
                                                        {response.respondedBy?.userId?.name|| 'Unknown User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {response.respondedBy?.userType || 'User'}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {new Date(response.respondedAt || response.createdAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-800 ml-11">{response.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Evidence Files */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-500">Evidence Files</span>
                                {dispute.evidenceFiles && dispute.evidenceFiles.length > 0 && (
                                    <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-semibold">
                                        {dispute.evidenceFiles.length} {dispute.evidenceFiles.length === 1 ? 'File' : 'Files'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {dispute.evidenceFiles && dispute.evidenceFiles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dispute.evidenceFiles.map((file, index) => (
                                    <div key={file._id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-300 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <a 
                                                    href={file.fileUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-sm font-medium text-primary-600 hover:text-primary-700 underline flex items-center"
                                                >
                                                    <Icon icon="heroicons:document" className="w-4 h-4 mr-1" />
                                                    Evidence {index + 1} ({file.fileType})
                                                </a>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs text-gray-600">
                                                        <span className="font-medium">Uploaded by:</span> {file.uploadedBy?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        <span className="font-medium">Type:</span> <span className="capitalize">{file.uploaderType}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(file.uploadedAt).toLocaleString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            {file.fileType === 'image' && (
                                                <img 
                                                    src={file.fileUrl} 
                                                    alt={`Evidence ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-lg ml-3 border border-gray-300"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <Icon icon="heroicons:folder-open" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No evidence files uploaded yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Job Details Card */}
            {job && Object.keys(job).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-primary-50 border-b border-primary-200 px-6 py-4">
                        <h3 className="text-xl font-bold text-primary-900">Related Job Details</h3>
                    </div>

                    <div className="p-6">
                        {/* Job Overview */}
                        <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-gray-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-semibold text-primary-700">
                                    {customer.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900">
                                    {jobInfo.services?.join(', ') || 'Repair Service'}
                                </h4>
                                <p className="text-gray-600 mb-2">{customer.name}</p>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
                                        {jobInfo.location?.city}
                                    </span>
                                    <span className="flex items-center">
                                        <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
                                        {jobInfo.urgency} priority
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(bookingDetails.pricing?.totalAmount, bookingDetails.pricing?.currency)}
                                </p>
                                <p className="text-sm text-gray-500">Total Amount</p>
                            </div>
                        </div>

                        {/* Job Description */}
                        {jobInfo.description && (
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <Icon icon="heroicons:document-text" className="w-5 h-5 mr-2 text-primary-600" />
                                    Job Description
                                </h4>
                                <p className="text-gray-600 text-sm">{jobInfo.description}</p>
                            </div>
                        )}

                        {/* Device & Booking Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Device Information */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <Icon icon="heroicons:device-phone-mobile" className="w-5 h-5 mr-2 text-primary-600" />
                                    Device Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Brand:</span>
                                        <span className="font-medium text-gray-900">{deviceInfo.brand}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Model:</span>
                                        <span className="font-medium text-gray-900">{deviceInfo.model}</span>
                                    </div>
                                    {deviceInfo.color && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Color:</span>
                                            <span className="font-medium text-gray-900 capitalize">{deviceInfo.color}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Warranty:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            deviceInfo.warrantyStatus === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {deviceInfo.warrantyStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                                <h4 className="font-semibold text-primary-900 mb-3 flex items-center">
                                    <Icon icon="heroicons:calendar" className="w-5 h-5 mr-2 text-primary-600" />
                                    Booking Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-primary-700">Service Type:</span>
                                        <span className="font-medium text-primary-900">{bookingDetails.serviceType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-primary-700">Scheduled:</span>
                                        <span className="font-medium text-primary-900">
                                            {new Date(bookingDetails.scheduledDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-primary-700">Base Price:</span>
                                        <span className="font-medium text-primary-900">
                                            {formatCurrency(bookingDetails.pricing?.basePrice, bookingDetails.pricing?.currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-primary-700">Parts Price:</span>
                                        <span className="font-medium text-primary-900">
                                            {formatCurrency(bookingDetails.pricing?.partsPrice, bookingDetails.pricing?.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        {jobInfo.location?.address && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <Icon icon="heroicons:map-pin" className="w-5 h-5 mr-2 text-primary-600" />
                                    Service Location
                                </h4>
                                <p className="text-gray-600 text-sm">{jobInfo.location.address}</p>
                                {jobInfo.location.city && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {jobInfo.location.city}, {jobInfo.location.zipCode}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Response Modal */}
            {showResponseModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !submittingResponse) {
                            setShowResponseModal(false);
                            setResponseMessage('');
                        }
                    }}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-semibold text-gray-900">Add Response</h2>
                            <button
                                onClick={() => {
                                    if (!submittingResponse) {
                                        setShowResponseModal(false);
                                        setResponseMessage('');
                                    }
                                }}
                                disabled={submittingResponse}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                                <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Response <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    rows={6}
                                    disabled={submittingResponse}
                                    placeholder="Enter your response to the dispute..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-gray-500">Minimum 10 characters required</p>
                                    <p className={`text-sm ${responseMessage.length < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                                        {responseMessage.length} characters
                                    </p>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">Response Guidelines:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>Be clear and professional in your response</li>
                                            <li>Provide factual information to support your case</li>
                                            <li>Avoid using offensive or inappropriate language</li>
                                            <li>Your response will be visible to both parties and admin</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSubmitResponse}
                                    disabled={submittingResponse || responseMessage.trim().length < 10}
                                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                                >
                                    {submittingResponse ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="heroicons:paper-airplane" className="w-5 h-5 mr-2" />
                                            Submit Response
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        if (!submittingResponse) {
                                            setShowResponseModal(false);
                                            setResponseMessage('');
                                        }
                                    }}
                                    disabled={submittingResponse}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Evidence Modal */}
            {showUploadModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !uploading) {
                            setShowUploadModal(false);
                            setSelectedFiles([]);
                            setPreviews([]);
                        }
                    }}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-semibold text-gray-900">Upload Evidence</h2>
                            <button
                                onClick={() => {
                                    if (!uploading) {
                                        setShowUploadModal(false);
                                        setSelectedFiles([]);
                                        setPreviews([]);
                                    }
                                }}
                                disabled={uploading}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                                <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* File Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Files (Images or PDF)
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                        className="hidden"
                                        id="evidence-upload"
                                    />
                                    <label
                                        htmlFor="evidence-upload"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <Icon icon="heroicons:cloud-arrow-up" className="w-10 h-10 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF, PDF (Max 5MB per file)</p>
                                    </label>
                                </div>
                            </div>

                            {/* File Previews */}
                            {previews.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        Selected Files ({previews.length})
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {previews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                {preview.type === 'image' ? (
                                                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                                        <img
                                                            src={preview.url}
                                                            alt={preview.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                                                        <Icon icon="heroicons:document" className="w-12 h-12 text-gray-400 mb-2" />
                                                        <p className="text-xs text-gray-600 px-2 text-center truncate w-full">
                                                            {preview.name}
                                                        </p>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    disabled={uploading}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                                                </button>
                                                <p className="mt-2 text-xs text-gray-600 truncate">
                                                    {preview.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">Upload Guidelines:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>You can upload multiple files at once</li>
                                            <li>Supported formats: JPEG, PNG, GIF, PDF</li>
                                            <li>Maximum file size: 5MB per file</li>
                                            <li>Clear images help resolve disputes faster</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleUploadEvidence}
                                    disabled={uploading || selectedFiles.length === 0}
                                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                                >
                                    {uploading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="heroicons:arrow-up-tray" className="w-5 h-5 mr-2" />
                                            Upload Files
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        if (!uploading) {
                                            setShowUploadModal(false);
                                            setSelectedFiles([]);
                                            setPreviews([]);
                                        }
                                    }}
                                    disabled={uploading}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisputeDetails;