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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [dispute?.responses?.length]);

    if (!dispute) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

    // Extract job data
    const jobInfo = job?.jobInfo || {};
    const customer = job?.customer || {};
    const bookingDetails = job?.bookingDetails || {};
    const deviceInfo = jobInfo.deviceInfo || {};

    // Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const isValidSize = file.size <= 5 * 1024 * 1024;
            const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type);
            if (!isValidSize) toast.error(`${file.name} is too large. Max size is 5MB`);
            if (!isValidType) toast.error(`${file.name} has invalid format. Only JPG, PNG, PDF allowed`);
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
        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setIsSendingMessage(true);
        try {
            const formData = new FormData();
            formData.append('message', message.trim());
            evidenceFiles.forEach(file => {
                formData.append('evidence', file);
            });

            const { data } = await axiosInstance.post(
                `/disputes/${dispute._id}/response`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (data.success) {
                toast.success('Message sent successfully');
                setMessage('');
                setEvidenceFiles([]);
                fetchJobDetails();
            }
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

    // Avatar initials helper
    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

    // Color per userType
    const getUserColor = (userType) => {
        if (userType === 'repairman') return { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', bubble: 'bg-violet-50 border-violet-200', name: 'text-violet-900' };
        if (userType === 'customer') return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', bubble: 'bg-blue-50 border-blue-200', name: 'text-blue-900' };
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', bubble: 'bg-gray-50 border-gray-200', name: 'text-gray-900' };
    };

    return (
        <div className="space-y-6">
            {/* Dispute Header Card */}
   <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
    
    {/* Header */}
    <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-5">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                    Dispute Information
                </h3>
                <p className="text-primary-100 text-sm mt-1">
                    Complete details and status overview
                </p>
            </div>
            <div className="flex items-center gap-2">
                <StatusBadge status={dispute.status} />
                <StatusBadge status={dispute.priority} />
            </div>
        </div>
    </div>

    <div className="p-8 space-y-8">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left Info */}
            <div className="space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                        Dispute ID
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                        {dispute.disputeId}
                    </p>
                </div>

                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                        Category
                    </p>
                    <p className="text-base text-gray-800 mt-1 capitalize font-medium">
                        {formatCategory(dispute.category)}
                    </p>
                </div>

                {dispute.paymentStatus && (
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                            Payment Status
                        </p>
                        <span className="inline-flex items-center mt-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-200 shadow-sm">
                            {dispute.paymentStatus?.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Users Section */}
            <div className="space-y-5">

                {/* Raised By */}
                <div className="rounded-xl p-5 border bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-blue-900">
                            Raised By
                        </span>
                        <Icon icon="heroicons:user" className="w-5 h-5 text-blue-600" />
                    </div>

                    <p className="text-lg font-bold text-blue-900">
                        {dispute.raisedBy.userId.name}
                    </p>

                    <span className="inline-block mt-3 px-3 py-1 bg-white/70 backdrop-blur text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                        {dispute.raisedBy.userType}
                    </span>
                </div>

                {/* Against User */}
                <div className="rounded-xl p-5 border bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-red-900">
                            Against User
                        </span>
                        <Icon icon="heroicons:user" className="w-5 h-5 text-red-600" />
                    </div>

                    <p className="text-lg font-bold text-red-900">
                        {dispute.againstUser.userId.name}
                    </p>

                    <span className="inline-block mt-3 px-3 py-1 bg-white/70 backdrop-blur text-red-700 rounded-full text-xs font-medium border border-red-200">
                        {dispute.againstUser.userType}
                    </span>
                </div>
            </div>
        </div>

        {/* Description */}
        {dispute.description && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                    Description
                </p>
                <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                    {dispute.description}
                </p>
            </div>
        )}

        {/* You can keep your existing Resolution, Admin Notes and Deadlines sections
            — just add:
            rounded-xl
            shadow-sm
            p-6
            border border-gray-100
            hover:shadow-md transition
            for modern feel.
        */}
    </div>
</div>


            {/* ===================== CHAT INTERFACE ===================== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200 px-6 py-4">
                    <h3 className="text-lg font-bold text-primary-900 flex items-center">
                        <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5 mr-2" />
                        Dispute Conversation
                    </h3>
                </div>

                <div className="h-[550px] flex flex-col">
                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">

                        {/* ── Initial dispute message ── */}
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-orange-700">
                                {getInitials(dispute.raisedBy?.userId?.name)}
                            </div>
                            <div className="flex-1 max-w-[80%]">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-900">{dispute.raisedBy?.userId?.name}</span>
                                    <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-medium capitalize">{dispute.raisedBy?.userType}</span>
                                    <span className="text-xs text-gray-400">{formatDate(dispute.createdAt)}</span>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded-2xl rounded-tl-sm px-4 py-3">
                                    <div className="mb-2">
                                        <span className="inline-block px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-semibold rounded">
                                            🚨 Dispute Opened · {formatCategory(dispute.category)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800 leading-relaxed">{dispute.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Responses — each response = one bubble with message + images together ── */}
                        {(dispute.responses || [])
                            .slice()
                            .sort((a, b) => new Date(a.respondedAt) - new Date(b.respondedAt))
                            .map((response, index) => {
                                const userType = response.respondedBy?.userType;
                                const name = response.respondedBy?.userId?.name || 'Unknown';
                                const colors = getUserColor(userType);
                                const hasFiles = response.evidenceFiles && response.evidenceFiles.length > 0;

                                return (
                                    <div key={response._id || index} className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className={`w-9 h-9 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 text-sm font-bold ${colors.text}`}>
                                            {getInitials(name)}
                                        </div>

                                        {/* Bubble */}
                                        <div className="flex-1 max-w-[80%]">
                                            {/* Name + badge + time */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm font-semibold ${colors.name}`}>{name}</span>
                                                <span className={`text-xs px-1.5 py-0.5 ${colors.bg} ${colors.text} rounded font-medium capitalize`}>{userType}</span>
                                                <span className="text-xs text-gray-400">{formatDate(response.respondedAt)}</span>
                                            </div>

                                            {/* Message card */}
                                            <div className={`${colors.bubble} border rounded-2xl rounded-tl-sm px-4 py-3 space-y-3`}>
                                                {/* Text message */}
                                                {response.message && (
                                                    <p className="text-sm text-gray-800 leading-relaxed">{response.message}</p>
                                                )}

                                                {/* Evidence files (images + pdfs) — shown right inside same bubble */}
                                                {hasFiles && (
                                                    <div className={`${response.message ? 'pt-2 flex gap-4 border-t border-gray-200' : ''} space-y-2`}>
                                                        {response.evidenceFiles.map((file, fIdx) => (
                                                            <div key={file._id || fIdx}>
                                                                {file.fileType === 'image' ? (
                                                                    /* Image preview */
                                                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" title="View full image">
                                                                        <img
                                                                            src={file.fileUrl}
                                                                            alt={`Evidence ${fIdx + 1}`}
                                                                            className="rounded-xl max-w-[260px] w-full object-cover cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                                        />
                                                                    </a>
                                                                ) : (
                                                                    /* PDF / other file */
                                                                    <a
                                                                        href={file.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors font-medium w-fit"
                                                                    >
                                                                        <Icon icon="heroicons:document-text" className="w-5 h-5 flex-shrink-0" />
                                                                        <span>View {file.fileType?.toUpperCase()} file</span>
                                                                        <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Chat Input Area ── */}
                    <div className="border-t border-gray-200 bg-white p-4">
                        {/* Selected files preview */}
                        {evidenceFiles.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {evidenceFiles.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm">
                                        {file.type.startsWith('image/') ? (
                                            <img src={URL.createObjectURL(file)} alt="" className="w-8 h-8 rounded object-cover" />
                                        ) : (
                                            <Icon icon="heroicons:document-text" className="w-5 h-5 text-gray-600" />
                                        )}
                                        <span className="text-gray-700 max-w-[120px] truncate">{file.name}</span>
                                        <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                                            <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end gap-2">
                            {/* File attach */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSendingMessage || evidenceFiles.length >= 5}
                                className="flex-shrink-0 p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Attach files (max 5)"
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

                            {/* Textarea */}
                            <div className="flex-1">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    disabled={isSendingMessage}
                                    rows={1}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 resize-none"
                                    style={{ minHeight: '44px', maxHeight: '120px' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                    }}
                                />
                            </div>

                            {/* Send */}
                            <button
                                type="button"
                                onClick={handleSendMessage}
                                disabled={isSendingMessage || (!message.trim() && evidenceFiles.length === 0)}
                                className="flex-shrink-0 p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Send message"
                            >
                                {isSendingMessage
                                    ? <Icon icon="heroicons:arrow-path" className="w-5 h-5 animate-spin" />
                                    : <Icon icon="heroicons:paper-airplane" className="w-5 h-5" />
                                }
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                            Enter to send • Shift+Enter for new line • Max 5 files (5MB each)
                        </p>
                    </div>
                </div>
            </div>

            {/* Job Details Card */}
            {job && Object.keys(job).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-primary-50 border-b border-primary-200 px-6 py-4">
                        <h3 className="text-xl font-bold text-primary-900">Related Job Details</h3>
                    </div>
                    {console.log(job,"jpb")}
                    <div className="p-6">
                        <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-gray-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-semibold text-primary-700">
                                    {customer.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900">
                                    {jobInfo.services?.map((service) => service.name).join(', ') || 'Repair Service'}
                                </h4>
                                <p className="text-gray-600 mb-2">{customer.name}</p>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
                                        {jobInfo.location?.city?.name || jobInfo.location?.city || ""}
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

                        {jobInfo.description && (
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <Icon icon="heroicons:document-text" className="w-5 h-5 mr-2 text-primary-600" />
                                    Job Description
                                </h4>
                                <p className="text-gray-600 text-sm">{jobInfo.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${deviceInfo.warrantyStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {deviceInfo.warrantyStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

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
                                            {bookingDetails.scheduledDate ? new Date(bookingDetails.scheduledDate).toLocaleDateString() : '—'}
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

                        {jobInfo.location?.address && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <Icon icon="heroicons:map-pin" className="w-5 h-5 mr-2 text-primary-600" />
                                    Service Location
                                </h4>
                                <p className="text-gray-600 text-sm">{jobInfo.location.address}</p>
                                {jobInfo.location?.city && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {jobInfo.location?.city?.name || jobInfo.location.city}, {jobInfo.location.zipCode}
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