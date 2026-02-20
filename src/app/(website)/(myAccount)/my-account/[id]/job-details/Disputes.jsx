import React, { useState, useRef, useEffect } from 'react'
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import DisputeDetails from './DisputeDetails';
import { Icon } from '@iconify/react';

const DISPUTE_CATEGORIES = [
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'quality_of_work', label: 'Quality of Work' },
    { value: 'service_not_provided', label: 'Service Not Provided' },
    { value: 'damaged_property', label: 'Damaged Property' },
    { value: 'unprofessional_behavior', label: 'Unprofessional Behavior' },
    { value: 'cancellation_issue', label: 'Cancellation Issue' },
    { value: 'other', label: 'Other' }
];

const DISPUTE_SCHEMA = yup.object({
    category: yup
        .string()
        .required('Please select a dispute category'),
    description: yup
        .string()
        .required('Description is required')
        .min(5, 'Description must be at least 20 characters')
        .max(1000, 'Description cannot exceed 1000 characters')
});

const Disputes = ({ bookingId, status, dispute, fetchJob }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [message, setMessage] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm({
        resolver: yupResolver(DISPUTE_SCHEMA),
        defaultValues: {
            category: '',
            description: ''
        }
    });

    const { token } = useSelector((state) => state.auth);
    const watchDescription = watch('description', '');

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [dispute?.responses, dispute?.evidenceFiles]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
            // if (message.trim()) {
            //     const { data } = await axiosInstance.post(
            //         `/disputes/${dispute?._id}/response`,
            //         { message: message.trim() },
            //         {
            //             headers: {
            //                 'Authorization': `Bearer ${token}`,
            //                 'Content-Type': 'application/json'
            //             }
            //         }
            //     );

            //     if (data.success) {
            //         toast.success('Response sent successfully');
            //         setMessage('');
            //     }
            // }

            // If there are files, upload evidence
            if (evidenceFiles.length > 0) {
                const formData = new FormData();
                formData.append("message",message.trim())
                formData.append('bookingId', bookingId);
                evidenceFiles.forEach(file => {
                    formData.append('evidence', file);
                });

                const { data: evidenceData } = await axiosInstance.post(
                    `/disputes/${dispute?._id}/response`,
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

            fetchJob();
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

    const onSubmit = async (formData) => {
        setIsSubmitting(true);

        try {
            const { data } = await axiosInstance.post('/disputes/create', {
                bookingId,
                category: formData.category,
                description: formData.description.trim()
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (data.success) {
                toast.success('Dispute created successfully');
                fetchJob();
                reset();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create dispute';
            toast.error(errorMessage);
            console.error('Error creating dispute:', error);
        } finally {
            setIsSubmitting(false);
        }
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

    const commonInputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors`;
    const errorClasses = 'border-red-500';

    if (status === "disputed") {
        return (
            <div className="bg-gray-50 py-3 px-4 min-h-screen flex flex-col">
                {/* Dispute Details Header */}
                <div className="flex-shrink-0 mb-4">
                    <DisputeDetails dispute={dispute} />
                </div>

                {/* Chat Messages Area - Scrollable */}
                <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
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

                        {console.log('Dispute Responses:', dispute)}

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
        );
    }

    return (
        <div className="bg-gray-50 py-3 px-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            Dispute Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="category"
                            {...register('category')}
                            className={`${commonInputClasses} ${errors.category ? errorClasses : 'border-gray-300'}`}
                            disabled={isSubmitting}
                        >
                            <option value="">Select a category</option>
                            {DISPUTE_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            {...register('description')}
                            rows={6}
                            placeholder="Please describe your issue in detail..."
                            className={`${commonInputClasses} resize-none ${errors.description ? errorClasses : 'border-gray-300'}`}
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <div>
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description.message}</p>
                                )}
                            </div>
                            <p className={`text-sm ${watchDescription.length > 1000 ? 'text-red-600' : 'text-gray-500'}`}>
                                {watchDescription.length}/1000
                            </p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Payment for this booking will be held until the dispute is resolved</li>
                                        <li>Our team will review your case within 24-48 hours</li>
                                        <li>Both parties will be notified of the dispute status</li>
                                        <li>False disputes may result in account penalties</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 py-3 px-4 rounded-lg text-white font-medium ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700'
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Creating Dispute...
                                </span>
                            ) : (
                                'Submit Dispute'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => reset()}
                            disabled={isSubmitting}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Disputes;