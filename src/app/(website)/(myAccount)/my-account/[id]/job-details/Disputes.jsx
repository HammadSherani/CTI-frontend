import React, { useState } from 'react'
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import DisputeDetails from './DisputeDetails';
import AddResponseModal from './Addresponsemodal';

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
    const [uploadingEvidence, setUploadingEvidence] = useState(false);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

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

    const handleUploadEvidence = async () => {
        if (evidenceFiles.length === 0) {
            toast.error('Please select at least one file');
            return;
        }
        setUploadingEvidence(true);
        try {
            const formData = new FormData();
            formData.append('bookingId', bookingId);
            evidenceFiles.forEach(file => {
                formData.append('evidence', file);
            });
            const { data } = await axiosInstance.post(`/disputes/${dispute?._id}/evidence`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (data.success) {
                toast.success('Evidence uploaded successfully');
                fetchJob()
                setEvidenceFiles([]);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to upload evidence';
            toast.error(errorMessage);
            console.error('Error uploading evidence:', error);
        } finally {
            setUploadingEvidence(false);
        }
    };

    const onSubmit = async (formData) => {
        setIsSubmitting(true);

        try {
            console.log('bookingId', bookingId);

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
                fetchJob()
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

    const handleResponseSuccess = () => {
        fetchJob(); // Refresh dispute data
    };

    const commonInputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors`;
    const errorClasses = 'border-red-500';

    if (status === "disputed") {
        return (
            <>
                <div className="bg-gray-50 py-3 px-4">
                    <DisputeDetails dispute={dispute} />
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Dispute Under Review</h2>
                                <p className="text-sm text-gray-600 mt-1">Your dispute is being reviewed by our team</p>
                            </div>
                        </div>

                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-primary-700">
                                        You can provide additional information by clicking "Add Response" button below.
                                        Upload evidence to support your case.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Add Response Button */}
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={() => setIsResponseModalOpen(true)}
                                disabled={dispute?.status === 'resolved' || dispute?.status === 'closed'}
                                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Response
                            </button>
                        </div>

                        {/* Evidence Upload Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                Upload Evidence
                            </h3>

                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <input
                                        type="file"
                                        id="evidence"
                                        multiple
                                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={uploadingEvidence || evidenceFiles.length >= 5}
                                    />
                                    <label
                                        htmlFor="evidence"
                                        className="cursor-pointer"
                                    >
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-600">
                                            <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            JPG, PNG or PDF (Max 5MB, up to 5 files)
                                        </p>
                                    </label>
                                </div>

                                {evidenceFiles.length > 0 && (
                                    <div className="space-y-2">
                                        {evidenceFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <svg className="w-8 h-8 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {evidenceFiles.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleUploadEvidence}
                                    disabled={uploadingEvidence}
                                    className={`w-full mt-4 py-3 px-4 rounded-lg text-white font-medium ${uploadingEvidence
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-primary-600 hover:bg-primary-700'
                                        }`}
                                >
                                    {uploadingEvidence ? (
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
                                            Uploading...
                                        </span>
                                    ) : (
                                        'Upload Evidence'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Response Modal */}
                <AddResponseModal
                    isOpen={isResponseModalOpen}
                    onClose={() => setIsResponseModalOpen(false)}
                    disputeId={dispute?._id}
                    onSuccess={handleResponseSuccess}
                />
            </>
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

export default Disputes