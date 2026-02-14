'use client'

import StatusBadge from '@/components/partials/customer/Offer/StatusBadge';
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const DisputeDetails = ({ dispute, job, fetchJobDetails }) => {
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [message, setMessage] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { token } = useSelector((state) => state.auth);

    if (!dispute) return null;

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [dispute?.responses, dispute?.evidenceFiles]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const formatCategory = (category) => {
        return category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatCurrency = (amount, currency = 'TRY') => {
        return `${currency} ${amount?.toLocaleString() || 0}`;
    };

    const currencySymbol = 'TRY';

    // Extract job data
    const jobInfo = job?.jobInfo || {};
    const customer = job?.customer || {};
    const bookingDetails = job?.bookingDetails || {};
    const deviceInfo = jobInfo.deviceInfo || {};

    // Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
            const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type);

            if (!isValidSize) {
                toast.error(`${file.name} is too large. Max size is 5MB`);
            }
            if (!isValidType) {
                toast.error(`${file.name} has invalid format. Only JPG, PNG, PDF allowed`);
            }

            return isValidSize && isValidType;
        });

        setEvidenceFiles(prev => [...prev, ...validFiles].slice(0, 5));
    };

    const removeFile = (index) => {
        setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async () => {
        if (!message.trim() && evidenceFiles.length === 0) {
            toast.error('Please enter a message or select files to upload');
            return;
        }

        if (message.trim() && message.trim().length < 1) {
            toast.error('Message must be at least 10 characters');
            return;
        }

        setIsSendingMessage(true);

        try {
            // If there's a message, send response
            if (message.trim()) {
                const { data } = await axiosInstance.post(
                    `/disputes/${dispute._id}/response`,
                    { message: message.trim() },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (data.success) {
                    toast.success('Response sent successfully');
                    setMessage('');
                }
            }

            // If there are files, upload evidence
            if (evidenceFiles.length > 0) {
                const formData = new FormData();
                evidenceFiles.forEach(file => {
                    formData.append('evidence', file);
                });

                const { data: evidenceData } = await axiosInstance.post(
                    `/disputes/${dispute._id}/evidence`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                if (evidenceData.success) {
                    toast.success('Evidence uploaded successfully');
                    setEvidenceFiles([]);
                }
            }

            fetchJobDetails();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send message';
            toast.error(errorMessage);
            console.error('Error sending message:', error);
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="space-y-6">
            {/* Dispute Header Card */}
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

                            {dispute.paymentStatus && (
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Payment Status</span>
                                    <span className="inline-block mt-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold border border-orange-200">
                                        {dispute.paymentStatus?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            )}
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
                                <span className="inline-block mt-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium">
                                    {dispute.againstUser.userType}
                                </span>
                            </div>
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

                    {/* Resolution Information */}
                    {dispute.status === 'resolved' && dispute.resolution && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <Icon icon="heroicons:check-circle" className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-green-900">Dispute Resolved</h4>
                                            <p className="text-sm text-green-700">
                                                {new Date(dispute.resolution.resolvedAt).toLocaleString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
                                        {dispute.resolution.resolutionType?.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white rounded-lg p-4 border border-green-200">
                                        <span className="text-xs font-medium text-green-700 flex items-center mb-1">
                                            <Icon icon="heroicons:user" className="w-4 h-4 mr-1" />
                                            Resolved By
                                        </span>
                                        <p className="text-base font-semibold text-gray-900">
                                            {dispute.resolution.resolvedBy?.name || 'Admin'}
                                        </p>
                                        {dispute.resolution.resolvedBy?.email && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {dispute.resolution.resolvedBy.email}
                                            </p>
                                        )}
                                    </div>

                                    {dispute.resolution.refundAmount && (
                                        <div className="bg-white rounded-lg p-4 border border-green-200">
                                            <span className="text-xs font-medium text-green-700 flex items-center mb-1">
                                                <Icon icon="heroicons:banknotes" className="w-4 h-4 mr-1" />
                                                Refund Amount
                                            </span>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(dispute.resolution.refundAmount, bookingDetails.pricing?.currency || 'TRY')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {dispute.resolution.resolutionNotes && (
                                    <div className="bg-white rounded-lg p-4 border border-green-200">
                                        <span className="text-xs font-medium text-green-700 flex items-center mb-2">
                                            <Icon icon="heroicons:document-text" className="w-4 h-4 mr-1" />
                                            Resolution Notes
                                        </span>
                                        <p className="text-sm text-gray-800 leading-relaxed">
                                            {dispute.resolution.resolutionNotes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Admin Notes */}
                    {dispute.adminNotes && dispute.adminNotes.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center mb-3">
                                <Icon icon="heroicons:clipboard-document-list" className="w-5 h-5 text-purple-600 mr-2" />
                                <span className="text-sm font-medium text-gray-700">Admin Notes</span>
                            </div>
                            <div className="space-y-3">
                                {dispute.adminNotes.map((note, index) => (
                                    <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                                                    <Icon icon="heroicons:user-circle" className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-purple-900">
                                                        {note.addedBy?.name || 'Admin'}
                                                    </p>
                                                    {note.addedBy?.email && (
                                                        <p className="text-xs text-purple-700">{note.addedBy.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-purple-600">
                                                {new Date(note.addedAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-800 pl-10">{note.note}</p>
                                    </div>
                                ))}
                            </div>
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
                                                    {new Date(dispute.deadlines.responseDeadline).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
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
                                                    {new Date(dispute.deadlines.resolutionDeadline).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200 px-6 py-4">
                    <h3 className="text-lg font-bold text-primary-900 flex items-center">
                        <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5 mr-2" />
                        Dispute Conversation
                    </h3>
                </div>

                {/* Messages Area */}
                <div className="h-[500px] flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Initial Dispute Message */}
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 capitalize">
                                                {dispute.raisedBy?.userId?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {dispute.raisedBy?.userType} • Dispute Created
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(dispute.createdAt)}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                                            {dispute.category?.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800">{dispute.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Responses and Evidence Files - Chronologically Merged */}
                        {[
                            ...(dispute.responses || []).map(r => ({ ...r, type: 'response' })),
                            ...(dispute.evidenceFiles || []).map(e => ({ ...e, type: 'evidence' }))
                        ]
                            .sort((a, b) => {
                                const dateA = new Date(a.respondedAt || a.createdAt || a.uploadedAt);
                                const dateB = new Date(b.respondedAt || b.createdAt || b.uploadedAt);
                                return dateA - dateB;
                            })
                            .map((item, index) => {
                                if (item.type === 'response') {
                                    return (
                                        <div key={`response-${index}`} className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Icon icon="heroicons:user" className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900 capitalize">
                                                                {item.respondedBy?.userId?.name || 'Unknown User'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {item.respondedBy?.userType || 'User'}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(item.respondedAt || item.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-800">{item.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    // Evidence file
                                    return (
                                        <div key={`evidence-${index}`} className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Icon icon="heroicons:paper-clip" className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                Evidence Uploaded
                                                            </p>
                                                            <p className="text-xs text-gray-500 capitalize">
                                                                By {item.uploaderType}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(item.uploadedAt)}
                                                        </span>
                                                    </div>
                                                    <a
                                                        href={item.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                    >
                                                        <Icon icon="heroicons:document" className="w-4 h-4" />
                                                        View {item.fileType} file
                                                        <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4" />
                                                    </a>
                                                    {item.fileType === 'image' && (
                                                        <img
                                                            src={item.fileUrl}
                                                            alt="Evidence"
                                                            className="mt-3 rounded-lg max-w-xs"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            })}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Area - Fixed at Bottom */}
                    <div className="border-t border-gray-200 bg-white p-4">
                        {/* Selected Files Preview */}
                        {evidenceFiles.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {evidenceFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <Icon icon="heroicons:document" className="w-4 h-4 text-gray-600" />
                                        <span className="text-gray-700 max-w-[150px] truncate">
                                            {file.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Input Box with Buttons */}
                        <div className="flex items-end gap-2">
                            {/* File Upload Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSendingMessage || evidenceFiles.length >= 5}
                                className="flex-shrink-0 p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Attach files"
                            >
                                <Icon icon="heroicons:paper-clip" className="w-5 h-5" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isSendingMessage || evidenceFiles.length >= 5}
                            />

                            {/* Message Input */}
                            <div className="flex-1">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    disabled={isSendingMessage}
                                    rows={1}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 resize-none"
                                    style={{ minHeight: '44px', maxHeight: '120px' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                    }}
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                type="button"
                                onClick={handleSendMessage}
                                disabled={isSendingMessage || (!message.trim() && evidenceFiles.length === 0)}
                                className="flex-shrink-0 p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Send message"
                            >
                                {isSendingMessage ? (
                                    <Icon icon="heroicons:arrow-path" className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Icon icon="heroicons:paper-airplane" className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Helper Text */}
                        <p className="text-xs text-gray-500 mt-2">
                            Press Enter to send • Shift+Enter for new line • Max 5 files (5MB each)
                        </p>
                    </div>
                </div>
            </div>

            {/* Job Details Card */}
            {job && job.length > 0 && (
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
        </div>
    );
};

export default DisputeDetails;