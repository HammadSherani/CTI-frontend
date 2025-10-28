import StatusBadge from '@/components/partials/customer/Offer/StatusBadge';
import { Icon } from '@iconify/react';
import React from 'react';


const AddResponseModal = ({ isOpen, onClose, onSubmit, disputeId }) => {
    const [formData, setFormData] = useState({
        message: '',
        evidenceFiles: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            evidenceFiles: files
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.message.trim()) {
            newErrors.message = 'Response message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Response must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            const submitData = new FormData();
            submitData.append('message', formData.message.trim());
            submitData.append('disputeId', disputeId);
            
            // Append files if any
            formData.evidenceFiles.forEach((file) => {
                submitData.append('evidenceFiles', file);
            });

            await onSubmit(submitData);
            
            // Reset form
            setFormData({
                message: '',
                evidenceFiles: []
            });
            setErrors({});
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to submit response' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                message: '',
                evidenceFiles: []
            });
            setErrors({});
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={handleClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5 mr-2" />
                            Add Response
                        </h3>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
                        >
                            <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-4">
                        {/* Error message */}
                        {errors.submit && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                                <Icon icon="heroicons:exclamation-circle" className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                                <p className="text-sm text-red-600">{errors.submit}</p>
                            </div>
                        )}

                        {/* Message field */}
                        <div className="mb-4">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Response Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows="6"
                                value={formData.message}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                    errors.message ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter your response to this dispute..."
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Minimum 10 characters required
                            </p>
                        </div>

                        {/* File upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attach Evidence Files (Optional)
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Icon icon="heroicons:cloud-arrow-up" className="w-10 h-10 text-gray-400 mb-2" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            PDF, PNG, JPG or JPEG (Max 10MB each)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={handleFileChange}
                                        disabled={isSubmitting}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            
                            {/* Selected files display */}
                            {formData.evidenceFiles.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {formData.evidenceFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex items-center">
                                                <Icon icon="heroicons:document" className="w-5 h-5 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-700 truncate max-w-xs">
                                                    {file.name}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    ({(file.size / 1024).toFixed(2)} KB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
                                                    }));
                                                }}
                                                disabled={isSubmitting}
                                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                            >
                                                <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="heroicons:paper-airplane" className="w-4 h-4 mr-2" />
                                        Submit Response
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const DisputeDetails = ({ dispute }) => {
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

    const currencySymbol = '$';

    return (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Dispute Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dispute Info */}
                <div>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm font-medium text-gray-600">Status:</span>
                            <div className="mt-1">
                                <StatusBadge status={dispute.status} />
                            </div>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Category:</span>
                            <p className="text-gray-800 capitalize">{formatCategory(dispute.category)}</p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Priority:</span>
                            <div className="mt-1">
                                <StatusBadge status={dispute.priority} />
                            </div>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                            <p className="text-gray-800 capitalize">{dispute.paymentStatus?.replace('_', ' ')}</p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Escalated:</span>
                            <p className="text-gray-800">{dispute.isEscalated ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>

                {/* Parties & Resolution Info */}
                <div>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm font-medium text-gray-600">Raised By:</span>
                            <p className="text-gray-800 font-semibold">
                                {dispute.raisedBy.userId.name}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">{dispute.raisedBy.userType}</p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Against:</span>
                            <p className="text-gray-800 font-semibold">
                                {dispute.againstUser.userId.name}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">{dispute.againstUser.userType}</p>
                        </div>

                        {dispute.resolution?.refundAmount > 0 && (
                            <div className="border-t pt-2">
                                <span className="text-sm font-medium text-gray-600">Refund Amount:</span>
                                <p className="text-lg font-bold text-primary-600">
                                    {currencySymbol}{dispute.resolution.refundAmount}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Description */}
            {dispute.description && (
                <div className="mt-4 pt-4 border-t border-primary-200">
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="text-gray-800 mt-1">
                        {dispute.description}
                    </p>
                </div>
            )}

            {/* Deadlines */}
            {dispute.deadlines && (
                <div className="mt-4 pt-4 border-t border-primary-200">
                    <span className="text-sm font-medium text-gray-600">Important Deadlines:</span>
                    <div className="mt-2 space-y-1">
                        {dispute.deadlines.responseDeadline && (
                            <p className="text-sm text-gray-600">
                                Response Deadline: {formatDate(dispute.deadlines.responseDeadline)}
                            </p>
                        )}
                        {dispute.deadlines.resolutionDeadline && (
                            <p className="text-sm text-gray-600">
                                Resolution Deadline: {formatDate(dispute.deadlines.resolutionDeadline)}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Evidence Files */}
            {dispute.evidenceFiles && dispute.evidenceFiles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-primary-200">
                    <span className="text-sm font-medium text-gray-600">Evidence Files:</span>
                    <div className="mt-2 space-y-3">
                        {dispute.evidenceFiles.map((file, index) => (
                            <div key={file._id || index} className="bg-white rounded p-3 border border-gray-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <a
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-primary-600 hover:text-primary-700 underline"
                                        >
                                            Evidence {index + 1} ({file.fileType})
                                        </a>
                                        <div className="mt-1 space-y-0.5">
                                            <p className="text-xs text-gray-600">
                                                Uploaded by: <span className="capitalize">{file.uploaderType}</span>
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
                                            className="w-16 h-16 object-cover rounded ml-3"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {dispute.responses.map((response, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center mr-3">
                                <Icon icon="heroicons:user" className="w-4 h-4 text-primary-700" />
                            </div>
                            <div>
                                <p className="text-sm capitalize font-semibold text-gray-900">
                                    {response.respondedBy?.userId?.name || 'Unknown User'}
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
    );
};

export default DisputeDetails;